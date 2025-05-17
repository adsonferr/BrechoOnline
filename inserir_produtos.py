import sqlite3


def preencher_produtos():
    try:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute('PRAGMA foreign_keys = ON;')  # Habilita verificação de chaves estrangeiras

            # Inserir categorias (se não existirem)
            categorias = [
                ('Casual', 'Roupas para o dia a dia'),
                ('Formal', 'Roupas para ocasiões especiais'),
                ('Esportivo', 'Roupas para atividades físicas'),
            ]
            cursor.executemany('INSERT OR IGNORE INTO categorias (nome, descricao) VALUES (?, ?)', categorias)

            # Obter IDs das categorias
            cursor.execute('SELECT id_categoria, nome FROM categorias')
            categorias_dict = {row[1]: row[0] for row in cursor.fetchall()}

            # Lista de produtos a inserir (baseada nos cards do index.html e outros exemplos)
            produtos = [
                (categorias_dict['Casual'], '/static/Imgs/roupa-1.png', 'Vestido curto vermelho de alça', 'Zara', 'M',
                 40.00),
                (categorias_dict['Casual'], '/static/Imgs/roupa-3.png', 'Saia curta preta', 'H&M', 'S', 30.00),
                (categorias_dict['Casual'], '/static/Imgs/roupa-2.png', 'Blusa de manga curta rosa', 'Renner', 'M',
                 35.00),
                (categorias_dict['Casual'], '/static/Imgs/roupa-11.png', 'Vestido curto branco e rosa', 'Forever 21',
                 'P', 40.00),
                (categorias_dict['Casual'], '/static/Imgs/roupa-12.png', 'Cropped de manga comprida preto', 'C&A', 'M',
                 40.00),
                (categorias_dict['Casual'], '/static/Imgs/roupa-8.png', 'Vestido longo amarelo', 'Farm', 'G', 60.00),
                (categorias_dict['Casual'], '/static/Imgs/roupa-9.png', 'Blusa de manga comprida branca', 'Riachuelo',
                 'M', 40.00),
                (categorias_dict['Casual'], '/static/Imgs/roupa-5.png', 'Short comprido bege', 'Hering', 'M', 30.00),
                (categorias_dict['Casual'], '/static/Imgs/roupa-6.png', 'Short curto jeans', 'Levi\'s', 'P', 30.00),
                (categorias_dict['Casual'], '/static/Imgs/roupa-10.png', 'Blusa de manga curta cinza', 'Marisa', 'M',
                 30.00),
            ]

            # Inserir produtos
            cursor.executemany('''
                INSERT OR IGNORE INTO produtos (id_categoria, imagem, descricao, marca, tamanho, preco)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', produtos)

            conn.commit()
            print(f"{len(produtos)} produtos inseridos com sucesso (ou ignorados se já existiam).")

    except sqlite3.Error as e:
        print(f"Erro no banco de dados: {str(e)}")
    except KeyError as e:
        print(f"Erro: Categoria {str(e)} não encontrada.")
    except Exception as e:
        print(f"Erro inesperado: {str(e)}")


if __name__ == '__main__':
    preencher_produtos()
