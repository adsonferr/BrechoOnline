import sqlite3


def create_structure_database():
    with sqlite3.connect("database.db") as connection:
        cursor = connection.cursor()
        # Ativar suporte a chaves estrangeiras
        cursor.execute('PRAGMA foreign_keys = ON;')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pessoas (
                id_pessoa INTEGER PRIMARY KEY AUTOINCREMENT,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                celular VARCHAR(20),
                endereco VARCHAR(255),
                documento VARCHAR(20)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS doacoes (
                id_doacao INTEGER PRIMARY KEY AUTOINCREMENT,
                id_pessoa INTEGER NOT NULL,
                FOREIGN KEY (id_pessoa) REFERENCES pessoas(id_pessoa)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categorias (
                id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
                nome VARCHAR(100) NOT NULL,
                descricao TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS produtos (
                id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
                id_doacao INTEGER,
                id_categoria INTEGER,
                imagem VARCHAR(255),
                descricao VARCHAR(255) NOT NULL,
                marca VARCHAR(100),
                tamanho VARCHAR(50),
                preco DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (id_doacao) REFERENCES doacoes(id_doacao),
                FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS estoque (
                id_estoque INTEGER PRIMARY KEY AUTOINCREMENT,
                id_produto INTEGER NOT NULL,
                quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
                secao VARCHAR(50),
                prateleira VARCHAR(50),
                data_ultima_atualizacao DATE,
                FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS venda (
                id_venda INTEGER PRIMARY KEY AUTOINCREMENT,
                id_pessoa INTEGER NOT NULL,
                data_venda DATE NOT NULL,
                valor_total DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (id_pessoa) REFERENCES pessoas(id_pessoa)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS produto_venda (
                id_produto_venda INTEGER PRIMARY KEY AUTOINCREMENT,
                id_produto INTEGER NOT NULL,
                id_venda INTEGER NOT NULL,
                valor_venda DECIMAL(10,2) NOT NULL,
                UNIQUE(id_produto, id_venda),
                FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
                FOREIGN KEY (id_venda) REFERENCES venda(id_venda)
            )
        ''')

        connection.commit()
