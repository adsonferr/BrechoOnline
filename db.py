import aiosqlite


async def check_user_exists(user_id):
    """
    Verifica se um usuário existe no banco com o dado ID.
    Retorna True se existe, False caso contrário.
    """
    async with aiosqlite.connect('database.db') as conn:
        cursor = await conn.execute("SELECT id_pessoa FROM pessoas WHERE id_pessoa = ?", (user_id,))
        user = await cursor.fetchone()
    return user is not None


async def get_user_by_email(email):
    """
    Busca um usuário pelo email.
    Retorna a tupla do usuário (id_pessoa, nome, email, senha) ou None se não encontrado.
    """
    async with aiosqlite.connect('database.db') as conn:
        cursor = await conn.execute("SELECT * FROM pessoas WHERE email = ?", (email,))
        user = await cursor.fetchone()
    return user


async def insert_user(nome, email, senha_hash):
    """
    Insere um novo usuário no banco.
    Retorna True se bem-sucedido, lança exceção em caso de erro (como email duplicado).
    """
    async with aiosqlite.connect('database.db') as conn:
        cursor = await conn.execute(
            'INSERT INTO pessoas (nome, email, senha) VALUES (?, ?, ?)',
            (nome, email, senha_hash)
        )
        await conn.commit()
    return True


async def get_produtos():
    """
    Busca todos os produtos com suas categorias.
    Retorna uma lista de dicionários com os dados dos produtos.
    """
    async with aiosqlite.connect('database.db') as conn:
        conn.row_factory = aiosqlite.Row
        cursor = await conn.execute('''
            SELECT p.id_produto, p.imagem, p.descricao, p.marca, p.tamanho, p.preco, c.nome AS categoria
            FROM produtos p
            JOIN categorias c ON p.id_categoria = c.id_categoria
        ''')
        produtos = await cursor.fetchall()
        produtos_list = [
            {
                'id_produto': produto['id_produto'],
                'imagem': produto['imagem'],
                'descricao': produto['descricao'],
                'marca': produto['marca'],
                'tamanho': produto['tamanho'],
                'preco': f"R${produto['preco']:,.2f}".replace('.', ','),
                'categoria': produto['categoria']
            } for produto in produtos
        ]
    return produtos_list
