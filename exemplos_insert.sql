-- ============================================================
-- PASSO 1: Descobrir seu id_pessoa
-- ============================================================
-- Execute este comando para ver seu id_pessoa:
SELECT id_pessoa, nome, email FROM pessoas;

-- ============================================================
-- PASSO 2: Criar uma doação para sua pessoa
-- ============================================================
-- Substitua '1' pelo seu id_pessoa encontrado no passo anterior
-- Se você já tem uma doação, pule para o PASSO 3
INSERT INTO doacoes (id_pessoa) VALUES (1);

-- Verifique o id_doacao criado:
SELECT id_doacao, id_pessoa FROM doacoes WHERE id_pessoa = 1;

-- ============================================================
-- PASSO 3: Inserir categorias (se ainda não existirem)
-- ============================================================
-- As categorias são necessárias antes de inserir produtos
-- Use INSERT OR IGNORE para não duplicar se já existirem

-- Exemplo 1: Inserir uma categoria completa
INSERT OR IGNORE INTO categorias (nome, descricao)
VALUES ('Casual', 'Roupas para o dia a dia');

-- Exemplo 2: Inserir outra categoria
INSERT OR IGNORE INTO categorias (nome, descricao)
VALUES ('Formal', 'Roupas para ocasiões especiais');

-- Exemplo 3: Inserir categoria sem descrição
INSERT OR IGNORE INTO categorias (nome)
VALUES ('Esportivo');

-- Exemplo 4: Inserir múltiplas categorias de uma vez
INSERT OR IGNORE INTO categorias (nome, descricao) VALUES
('Casual', 'Roupas para o dia a dia'),
('Formal', 'Roupas para ocasiões especiais'),
('Esportivo', 'Roupas para atividades físicas'),
('Vintage', 'Roupas retrô e clássicas'),
('Plus Size', 'Roupas tamanhos grandes');

-- ============================================================
-- PASSO 4: Verificar categorias disponíveis e seus IDs
-- ============================================================
-- Execute este comando para ver todas as categorias e seus IDs:
SELECT id_categoria, nome, descricao FROM categorias;

-- ============================================================
-- PASSO 5: Inserir produtos COM id_doacao
-- ============================================================
-- IMPORTANTE: Substitua os valores:
-- - '1' no id_doacao pelo id_doacao que você criou no PASSO 2
-- - '1' no id_categoria pelo id_categoria correto (ver PASSO 3)

-- Exemplo 1: Produto completo COM doação
INSERT INTO produtos (id_doacao, id_categoria, imagem, descricao, marca, tamanho, preco)
VALUES (1, 1, '/static/Imgs/roupa-1.png', 'Vestido curto vermelho de alça', 'Zara', 'M', 40.00);

-- Exemplo 2: Outro produto COM doação
INSERT INTO produtos (id_doacao, id_categoria, imagem, descricao, marca, tamanho, preco)
VALUES (1, 1, '/static/Imgs/roupa-2.png', 'Blusa de manga curta rosa', 'Renner', 'M', 35.00);

-- Exemplo 3: Produto sem marca e tamanho COM doação
INSERT INTO produtos (id_doacao, id_categoria, imagem, descricao, preco)
VALUES (1, 2, '/static/Imgs/roupa-3.png', 'Terno preto elegante', 150.00);

-- Exemplo 4: Produto sem imagem COM doação
INSERT INTO produtos (id_doacao, id_categoria, descricao, marca, tamanho, preco)
VALUES (1, 3, 'Camiseta esportiva', 'Nike', 'G', 80.00);

-- Exemplo 5: Múltiplos produtos de uma vez COM doação
-- Substitua '1' pelo seu id_doacao
INSERT INTO produtos (id_doacao, id_categoria, imagem, descricao, marca, tamanho, preco) VALUES
(1, 1, '/static/Imgs/roupa-4.png', 'Vestido longo azul', 'Farm', 'G', 70.00),
(1, 1, '/static/Imgs/roupa-5.png', 'Short comprido bege', 'Hering', 'M', 30.00),
(1, 2, '/static/Imgs/roupa-6.png', 'Blazer cinza', 'Zara', 'P', 120.00);

-- Exemplo 6: Usando INSERT OR IGNORE (ignora se já existir) COM doação
INSERT OR IGNORE INTO produtos (id_doacao, id_categoria, imagem, descricao, marca, tamanho, preco)
VALUES (1, 1, '/static/Imgs/roupa-7.png', 'Saia curta preta', 'H&M', 'S', 30.00);

-- Exemplo 7: Mais produtos COM doação
INSERT INTO produtos (id_doacao, id_categoria, imagem, descricao, marca, tamanho, preco) VALUES
(1, 1, '/static/Imgs/roupa-8.png', 'Vestido longo amarelo', 'Farm', 'G', 60.00),
(1, 1, '/static/Imgs/roupa-9.png', 'Blusa de manga comprida branca', 'Riachuelo', 'M', 40.00),
(1, 1, '/static/Imgs/roupa-10.png', 'Blusa de manga curta cinza', 'Marisa', 'M', 30.00),
(1, 1, '/static/Imgs/roupa-11.png', 'Vestido curto branco e rosa', 'Forever 21', 'P', 40.00),
(1, 1, '/static/Imgs/roupa-12.png', 'Cropped de manga comprida preto', 'C&A', 'M', 40.00);

-- ============================================================
-- PASSO 6: Verificar produtos inseridos e seus IDs
-- ============================================================
-- Execute este comando para ver todos os produtos e seus IDs:
SELECT id_produto, descricao, preco FROM produtos;

-- ============================================================
-- PASSO 7: Inserir produtos no estoque
-- ============================================================
-- IMPORTANTE: Substitua os valores:
-- - '1' no id_produto pelo id_produto real do produto
-- - A quantidade deve ser >= 0
-- - secao, prateleira e data_ultima_atualizacao são opcionais

-- Exemplo 1: Estoque completo com todos os campos
INSERT INTO estoque (id_produto, quantidade, secao, prateleira, data_ultima_atualizacao)
VALUES (1, 5, 'Feminino', 'A-1', DATE('now'));

-- Exemplo 2: Estoque apenas com id_produto e quantidade (mínimo necessário)
INSERT INTO estoque (id_produto, quantidade)
VALUES (2, 10);

-- Exemplo 3: Estoque com secao e prateleira
INSERT INTO estoque (id_produto, quantidade, secao, prateleira)
VALUES (3, 3, 'Masculino', 'B-2');

-- Exemplo 4: Estoque com data de atualização
INSERT INTO estoque (id_produto, quantidade, data_ultima_atualizacao)
VALUES (4, 7, DATE('now'));

-- Exemplo 5: Múltiplos produtos no estoque de uma vez
-- Substitua os id_produto pelos IDs reais dos seus produtos
INSERT INTO estoque (id_produto, quantidade, secao, prateleira, data_ultima_atualizacao) VALUES
(1, 5, 'Feminino', 'A-1', DATE('now')),
(2, 10, 'Feminino', 'A-2', DATE('now')),
(3, 3, 'Masculino', 'B-1', DATE('now')),
(4, 7, 'Feminino', 'A-3', DATE('now')),
(5, 2, 'Feminino', 'A-4', DATE('now'));

-- Exemplo 6: Usando INSERT OR IGNORE (ignora se já existir)
INSERT OR IGNORE INTO estoque (id_produto, quantidade, secao, prateleira)
VALUES (6, 8, 'Feminino', 'A-5');

-- Exemplo 7: Atualizar estoque de um produto existente
-- Se o produto já tiver estoque, use UPDATE ao invés de INSERT
UPDATE estoque 
SET quantidade = 15, data_ultima_atualizacao = DATE('now')
WHERE id_produto = 1;

-- ============================================================
-- PASSO 8: Verificar estoque inserido
-- ============================================================
-- Execute este comando para ver todos os produtos com estoque:
SELECT 
    p.id_produto,
    p.descricao,
    p.preco,
    e.quantidade,
    e.secao,
    e.prateleira,
    e.data_ultima_atualizacao
FROM produtos p
LEFT JOIN estoque e ON p.id_produto = e.id_produto
ORDER BY p.id_produto;

-- ============================================================
-- RESUMO DOS PASSOS:
-- ============================================================
-- 1. Descobrir seu id_pessoa: SELECT id_pessoa FROM pessoas;
-- 2. Criar doação: INSERT INTO doacoes (id_pessoa) VALUES (SEU_ID_PESSOA);
-- 3. Verificar id_doacao criado: SELECT id_doacao FROM doacoes WHERE id_pessoa = SEU_ID_PESSOA;
-- 4. Inserir categorias: INSERT OR IGNORE INTO categorias (nome, descricao) VALUES (...);
-- 5. Verificar categorias: SELECT id_categoria, nome FROM categorias;
-- 6. Inserir produtos usando o id_doacao (passo 3) e id_categoria (passo 5)
-- 7. Verificar produtos inseridos: SELECT id_produto, descricao FROM produtos;
-- 8. Inserir produtos no estoque usando os id_produto encontrados no passo 7

