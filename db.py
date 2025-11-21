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


async def get_user_by_id(user_id):
    """
    Busca um usuário pelo ID.
    Retorna um dicionário com os dados do usuário ou None se não encontrado.
    """
    async with aiosqlite.connect('database.db') as conn:
        conn.row_factory = aiosqlite.Row
        cursor = await conn.execute("SELECT * FROM pessoas WHERE id_pessoa = ?", (user_id,))
        user = await cursor.fetchone()
        if user:
            return {
                'id_pessoa': user['id_pessoa'],
                'nome': user['nome'],
                'email': user['email'],
                'celular': user['celular'],
                'endereco': user['endereco'],
                'documento': user['documento']
            }
    return None


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
    Busca todos os produtos com suas categorias e estoque.
    Retorna produtos que tenham estoque disponível (quantidade > 0) ou que não tenham estoque cadastrado.
    Retorna uma lista de dicionários com os dados dos produtos.
    """
    async with aiosqlite.connect('database.db') as conn:
        conn.row_factory = aiosqlite.Row
        cursor = await conn.execute('''
            SELECT p.id_produto, p.imagem, p.descricao, p.marca, p.tamanho, p.preco, 
                   c.nome AS categoria, COALESCE(e.quantidade, 0) AS quantidade
            FROM produtos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            LEFT JOIN estoque e ON p.id_produto = e.id_produto
            WHERE p.id_categoria IS NOT NULL 
            AND (e.quantidade IS NULL OR e.quantidade > 0)
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
                'categoria': produto['categoria'],
                'quantidade': produto['quantidade']
            } for produto in produtos
        ]
    return produtos_list


async def get_carrinho(user_id):
    """
    Busca todos os itens do carrinho do usuário com informações dos produtos.
    Retorna uma lista de dicionários com os dados dos itens do carrinho.
    """
    async with aiosqlite.connect('database.db') as conn:
        conn.row_factory = aiosqlite.Row
        cursor = await conn.execute('''
            SELECT 
                c.id_carrinho,
                c.id_produto,
                c.quantidade,
                p.imagem,
                p.descricao,
                p.marca,
                p.tamanho,
                p.preco,
                cat.nome AS categoria
            FROM carrinho c
            JOIN produtos p ON c.id_produto = p.id_produto
            JOIN categorias cat ON p.id_categoria = cat.id_categoria
            WHERE c.id_pessoa = ?
            ORDER BY c.data_adicionado DESC
        ''', (user_id,))
        itens = await cursor.fetchall()
        carrinho_list = [
            {
                'id_carrinho': item['id_carrinho'],
                'id_produto': item['id_produto'],
                'quantidade': item['quantidade'],
                'imagem': item['imagem'],
                'descricao': item['descricao'],
                'marca': item['marca'],
                'tamanho': item['tamanho'],
                'preco': f"R${item['preco']:,.2f}".replace('.', ','),
                'categoria': item['categoria']
            } for item in itens
        ]
    return carrinho_list


async def add_to_carrinho(user_id, id_produto, quantidade=1):
    """
    Adiciona ou atualiza um item no carrinho do usuário.
    Se o produto já estiver no carrinho, atualiza a quantidade.
    Retorna True se bem-sucedido.
    """
    async with aiosqlite.connect('database.db') as conn:
        # Verifica se o item já existe no carrinho
        cursor = await conn.execute(
            'SELECT quantidade FROM carrinho WHERE id_pessoa = ? AND id_produto = ?',
            (user_id, id_produto)
        )
        existing = await cursor.fetchone()
        
        if existing:
            # Atualiza a quantidade
            new_quantity = existing[0] + quantidade
            await conn.execute(
                'UPDATE carrinho SET quantidade = ? WHERE id_pessoa = ? AND id_produto = ?',
                (new_quantity, user_id, id_produto)
            )
        else:
            # Insere novo item
            await conn.execute(
                'INSERT INTO carrinho (id_pessoa, id_produto, quantidade, data_adicionado) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
                (user_id, id_produto, quantidade)
            )
        await conn.commit()
    return True


async def update_carrinho_item(user_id, id_produto, quantidade):
    """
    Atualiza a quantidade de um item no carrinho.
    Se quantidade <= 0, remove o item do carrinho.
    Retorna True se bem-sucedido.
    """
    async with aiosqlite.connect('database.db') as conn:
        if quantidade <= 0:
            # Remove o item
            await conn.execute(
                'DELETE FROM carrinho WHERE id_pessoa = ? AND id_produto = ?',
                (user_id, id_produto)
            )
        else:
            # Atualiza a quantidade
            await conn.execute(
                'UPDATE carrinho SET quantidade = ? WHERE id_pessoa = ? AND id_produto = ?',
                (quantidade, user_id, id_produto)
            )
        await conn.commit()
    return True


async def remove_from_carrinho(user_id, id_produto):
    """
    Remove um item do carrinho do usuário.
    Retorna True se bem-sucedido.
    """
    async with aiosqlite.connect('database.db') as conn:
        await conn.execute(
            'DELETE FROM carrinho WHERE id_pessoa = ? AND id_produto = ?',
            (user_id, id_produto)
        )
        await conn.commit()
    return True


async def clear_carrinho(user_id):
    """
    Limpa todo o carrinho do usuário.
    Retorna True se bem-sucedido.
    """
    async with aiosqlite.connect('database.db') as conn:
        await conn.execute(
            'DELETE FROM carrinho WHERE id_pessoa = ?',
            (user_id,)
        )
        await conn.commit()
    return True