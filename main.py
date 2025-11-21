# Importa classes e funções principais do Flask para criar a aplicação web
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
# Importa aiosqlite para operações assíncronas com o banco de dados SQLite
import aiosqlite
# Importa uvicorn, um servidor ASGI para rodar a aplicação assincronamente
import uvicorn
# Importa funções para gerar e verificar hashes de senhas de forma segura
from werkzeug.security import generate_password_hash, check_password_hash
# Importa wraps para preservar metadados em decoradores
from functools import wraps
# Importa re para validação de expressões regulares (usado no email)
import re
# Importa db_create, que contém a lógica para criar a estrutura do banco de dados
import db_create
# Importa timedelta para configurar a duração da sessão
from datetime import timedelta
# Importa WsgiToAsgi para adaptar a aplicação Flask (WSGI) ao protocolo ASGI do Uvicorn
from asgiref.wsgi import WsgiToAsgi
# Importa funções de acesso ao banco de dados do módulo database.py
import db
# Importa bibliotecas para gerar QR code e códigos aleatórios
import random
import string
import qrcode
import io
import base64

# Cria uma instância da aplicação Flask
app = Flask(__name__, static_folder='static', template_folder='templates')
# Define uma chave secreta para assinar cookies de sessão (substitua por uma chave segura)
app.secret_key = 'sua_chave_secreta_aqui'
# Configura para não usar cache em desenvolvimento
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
# Configura a sessão para durar 7 dias
app.permanent_session_lifetime = timedelta(days=7)

# Configurações de segurança para cookies de sessão
# Impede que cookies sejam acessados por JavaScript, aumentando a segurança
app.config['SESSION_COOKIE_HTTPONLY'] = True
# Define se o cookie só é enviado em conexões HTTPS (False para desenvolvimento, True em produção)
app.config['SESSION_COOKIE_SECURE'] = False
# Define a política SameSite para proteger contra CSRF (Lax é um meio-termo entre segurança e usabilidade)
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'


# Define um decorador para exigir autenticação em rotas protegidas
def login_required(f):
    # Preserva metadados da função decorada
    @wraps(f)
    # Função assíncrona para verificar a autenticação
    async def decorated_function(*args, **kwargs):
        # Verifica se o usuário está logado (tem user_id na sessão)
        if 'user_id' not in session:
            # Redireciona para a página de login se não estiver logado
            return redirect(url_for('entrar'))
        # Verifica se o usuário ainda existe no banco usando a função do database.py
        if not await db.check_user_exists(session['user_id']):
            # Limpa a sessão se o usuário não existe mais
            session.clear()
            # Redireciona para a página de login
            return redirect(url_for('entrar'))
        # Executa a função original, suportando tanto funções assíncronas quanto síncronas
        result = f(*args, **kwargs)
        # Se for uma coroutine, aguarda
        if hasattr(result, '__await__'):
            return await result
        return result

    # Retorna a função decorada
    return decorated_function


# Define a rota para a página de criação de conta
@app.route('/criar-conta')
# Função síncrona para renderizar o template criar-conta.html
def criar_conta():
    # Retorna o template HTML para a página de registro
    return render_template('criar-conta.html')


# Define a rota para a página de login
@app.route('/entrar')
# Função síncrona para renderizar o template login.html
def entrar():
    # Retorna o template HTML para a página de login
    return render_template('login.html')


# Define a rota para o painel do usuário, protegida por login
@app.route('/painel-usuario')
# Aplica o decorador login_required para exigir autenticação
@login_required
# Função síncrona para renderizar o template painel-usuario.html
def painel_usuario():
    # Retorna o template HTML para o painel do usuário
    return render_template('painel-usuario.html')


# Define a rota para a página inicial
@app.route('/')
# Função síncrona para renderizar o template index.html
def index():
    # Retorna o template HTML para a página inicial
    return render_template('index.html')


# Define a rota para a página de checkout (informações), protegida por login
@app.route('/checkout')
# Aplica o decorador login_required para exigir autenticação
@login_required
# Função assíncrona para renderizar o template checkout.html
async def checkout():
    # Busca os dados do usuário logado
    user_id = session.get('user_id')
    user_data = await db.get_user_by_id(user_id)
    
    # Retorna o template HTML para a página de checkout com os dados do usuário
    return render_template('checkout.html', user=user_data)


# Define a rota para a página de pagamento, protegida por login
@app.route('/pagamento')
# Aplica o decorador login_required para exigir autenticação
@login_required
# Função assíncrona para renderizar o template pagamento.html com QR code
async def pagamento():
    # Gera código PIX aleatório (formato similar ao PIX)
    pix_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=32))
    pix_code = f"00020126580014br.gov.bcb.pix0136{pix_code}5204000053039865802BR5913Brecho Online6008BRASILIA62070503***6304{pix_code[:4]}"
    
    # Gera número de pedido aleatório
    pedido_numero = ''.join(random.choices(string.digits, k=9))
    
    # Gera QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(pix_code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Converte para base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    # Salva o código PIX e número do pedido na sessão
    session['pix_code'] = pix_code
    session['pedido_numero'] = pedido_numero
    
    # Retorna o template HTML para a página de pagamento com os dados
    return render_template('pagamento.html', 
                          pix_code=pix_code, 
                          pedido_numero=pedido_numero,
                          qr_code_base64=img_str)


# Define a rota para autenticação via POST
@app.route('/login', methods=['POST'])
# Função assíncrona para processar o login
async def login():
    # Obtém os dados JSON enviados na requisição (email e senha)
    data = request.get_json()
    # Extrai o email do JSON
    email = data.get('email')
    # Extrai a senha do JSON
    password = data.get('password')

    # Busca o usuário pelo email usando a função do database.py
    user = await db.get_user_by_email(email)
    # Verifica se o usuário existe
    if user:
        # Obtém a senha hasheada do banco (índice 3 da tupla)
        senha_no_banco = user[3]
        # Verifica se a senha fornecida corresponde à senha hasheada
        if check_password_hash(senha_no_banco, password):
            # Define a sessão como permanente (7 dias)
            session.permanent = True
            # Armazena o ID do usuário na sessão
            session['user_id'] = user[0]
            # Armazena o email do usuário na sessão
            session['user_email'] = user[2]
            # Retorna uma resposta JSON indicando sucesso
            return jsonify(success=True, message="Login bem-sucedido!")

    # Retorna uma resposta JSON indicando falha (email ou senha inválidos)
    return jsonify(success=False, message="Email ou senha inválidos."), 401


# Define a rota para logout via POST
@app.route('/logout', methods=['POST'])
# Função assíncrona para processar o logout
async def logout():
    # Remove o user_id da sessão, se existir
    session.pop('user_id', None)
    # Remove o user_email da sessão, se existir
    session.pop('user_email', None)
    # Retorna uma resposta JSON confirmando o logout
    return jsonify({"message": "Logout bem-sucedido!"}), 200


# Define a rota para verificar o status da sessão
@app.route('/check-session', methods=['GET'])
# Função assíncrona para verificar se o usuário está logado
async def check_session():
    # Verifica se há um user_id na sessão
    if 'user_id' in session:
        # Retorna uma resposta JSON indicando que o usuário está logado, com o email
        return jsonify({
            "logged_in": True,
            "user_email": session.get('user_email')
        })
    # Retorna uma resposta JSON indicando que o usuário não está logado
    return jsonify({"logged_in": False})


# Define a rota para registro de novo usuário via POST
@app.route('/register', methods=['POST'])
# Função assíncrona para processar o registro
async def register():
    # Obtém os dados JSON enviados na requisição
    data = request.get_json()
    # Extrai o nome do JSON
    nome = data.get('name')
    # Extrai o email do JSON
    email = data.get('email')
    # Extrai a senha do JSON
    senha = data.get('password')
    # Extrai a confirmação da senha do JSON
    confirmar = data.get('confirmPassword')

    # Verifica se todos os campos foram fornecidos
    if not nome or not email or not senha or not confirmar:
        # Retorna erro se algum campo estiver faltando
        return jsonify({"message": "Todos os campos são obrigatórios."}), 400

    # Verifica se a senha tem pelo menos 8 caracteres
    if len(senha) < 8:
        # Retorna erro se a senha for muito curta
        return jsonify({"message": "A senha deve ter pelo menos 8 caracteres."}), 400

    # Define uma expressão regular para validar o formato do email
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    # Verifica se o email é válido
    if not re.match(email_regex, email):
        # Retorna erro se o email for inválido
        return jsonify({"message": "E-mail inválido."}), 400

    # Verifica se as senhas coincidem
    if senha != confirmar:
        # Retorna erro se as senhas não coincidirem
        return jsonify({"message": "As senhas não coincidem."}), 400

    # Gera um hash seguro da senha
    senha_hash = generate_password_hash(senha)

    try:
        # Insere o novo usuário no banco usando a função do database.py
        await db.insert_user(nome, email, senha_hash)
        # Retorna uma resposta JSON indicando sucesso
        return jsonify({"message": "Usuário registrado com sucesso!"}), 201
    except aiosqlite.IntegrityError:
        # Retorna erro se o email já estiver registrado (violação de unicidade)
        return jsonify({"message": "Este e-mail já está registrado."}), 400
    except aiosqlite.Error as e:
        # Retorna erro genérico para outros problemas no banco
        return jsonify({"message": f"Erro no banco de dados: {str(e)}"}), 500


# Define a rota para obter a lista de produtos
@app.route('/api/produtos', methods=['GET'])
# Função assíncrona para buscar produtos
async def get_produtos():
    try:
        # Obtém a lista de produtos usando a função do database.py
        produtos_list = await db.get_produtos()
        # Retorna a lista de produtos como JSON
        return jsonify(produtos_list), 200
    except aiosqlite.Error as e:
        # Retorna erro se houver problema no banco
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500


# Define a rota para obter o carrinho do usuário
@app.route('/api/carrinho', methods=['GET'])
# Aplica o decorador login_required para exigir autenticação
@login_required
# Função assíncrona para buscar o carrinho
async def get_carrinho():
    try:
        # Obtém o ID do usuário da sessão
        user_id = session.get('user_id')
        # Busca o carrinho do usuário usando a função do database.py
        carrinho_list = await db.get_carrinho(user_id)
        # Retorna o carrinho como JSON
        return jsonify(carrinho_list), 200
    except aiosqlite.Error as e:
        # Retorna erro se houver problema no banco
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500


# Define a rota para adicionar produto ao carrinho
@app.route('/api/carrinho', methods=['POST'])
# Aplica o decorador login_required para exigir autenticação
@login_required
# Função assíncrona para adicionar produto ao carrinho
async def add_carrinho():
    try:
        # Obtém o ID do usuário da sessão
        user_id = session.get('user_id')
        # Obtém os dados JSON enviados na requisição
        data = request.get_json()
        # Extrai o ID do produto
        id_produto = data.get('id_produto')
        # Extrai a quantidade (padrão 1)
        quantidade = data.get('quantidade', 1)
        
        # Valida os dados
        if not id_produto:
            return jsonify({"error": "ID do produto é obrigatório."}), 400
        
        # Adiciona o produto ao carrinho
        await db.add_to_carrinho(user_id, id_produto, quantidade)
        # Retorna sucesso
        return jsonify({"message": "Produto adicionado ao carrinho com sucesso!"}), 201
    except aiosqlite.Error as e:
        # Retorna erro se houver problema no banco
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500


# Define a rota para atualizar item do carrinho
@app.route('/api/carrinho', methods=['PUT'])
# Aplica o decorador login_required para exigir autenticação
@login_required
# Função assíncrona para atualizar item do carrinho
async def update_carrinho():
    try:
        # Obtém o ID do usuário da sessão
        user_id = session.get('user_id')
        # Obtém os dados JSON enviados na requisição
        data = request.get_json()
        # Extrai o ID do produto
        id_produto = data.get('id_produto')
        # Extrai a quantidade
        quantidade = data.get('quantidade')
        
        # Valida os dados
        if not id_produto or quantidade is None:
            return jsonify({"error": "ID do produto e quantidade são obrigatórios."}), 400
        
        # Atualiza o item do carrinho
        await db.update_carrinho_item(user_id, id_produto, quantidade)
        # Retorna sucesso
        return jsonify({"message": "Carrinho atualizado com sucesso!"}), 200
    except aiosqlite.Error as e:
        # Retorna erro se houver problema no banco
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500


# Define a rota para remover item do carrinho
@app.route('/api/carrinho', methods=['DELETE'])
# Aplica o decorador login_required para exigir autenticação
@login_required
# Função assíncrona para remover item do carrinho
async def remove_carrinho():
    try:
        # Obtém o ID do usuário da sessão
        user_id = session.get('user_id')
        # Obtém os dados JSON enviados na requisição
        data = request.get_json()
        # Extrai o ID do produto
        id_produto = data.get('id_produto')
        
        # Valida os dados
        if not id_produto:
            return jsonify({"error": "ID do produto é obrigatório."}), 400
        
        # Remove o item do carrinho
        await db.remove_from_carrinho(user_id, id_produto)
        # Retorna sucesso
        return jsonify({"message": "Produto removido do carrinho com sucesso!"}), 200
    except aiosqlite.Error as e:
        # Retorna erro se houver problema no banco
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500


# Adapta a aplicação Flask (WSGI) para o protocolo ASGI do Uvicorn
asgi_app = WsgiToAsgi(app)

# Verifica se o script está sendo executado diretamente
if __name__ == '__main__':
    # Cria a estrutura do banco de dados (tabelas) se não existir
    db_create.create_structure_database()
    # Inicia o servidor Uvicorn na porta 5000, escutando em todas as interfaces
    uvicorn.run(asgi_app, host="127.0.0.1", port=5000)
