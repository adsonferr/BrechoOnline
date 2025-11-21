document.addEventListener('DOMContentLoaded', async () => {
    const cardsContainer = document.getElementById('cards-produtos');
    const sessionMessage = document.getElementById('session-message');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Variável para controlar se o usuário está logado
    let isLoggedIn = false;

    // Função para verificar o status da sessão
    async function checkSession() {
        try {
            const response = await fetch('/check-session', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            // Atualiza status de login
            isLoggedIn = data.logged_in || false;

            if (data.logged_in) {
                // Usuário está logado
                sessionMessage.innerText = `Bem-vindo, ${data.user_email}!`;
                sessionMessage.classList.add('text-success');
                registerBtn.style.display = 'none';
                loginBtn.style.display = 'none';
                dashboardBtn.style.display = 'inline-block';
                logoutBtn.style.display = 'inline-block';
            } else {
                // Usuário não está logado
                sessionMessage.innerText = '';
                registerBtn.style.display = 'inline-block';
                loginBtn.style.display = 'inline-block';
                dashboardBtn.style.display = 'none';
                logoutBtn.style.display = 'none';
            }
        } catch (err) {
            console.error('Erro ao verificar sessão:', err);
            isLoggedIn = false;
            sessionMessage.innerText = 'Erro ao verificar sessão.';
            sessionMessage.classList.add('text-danger');
            registerBtn.style.display = 'inline-block';
            loginBtn.style.display = 'inline-block';
            dashboardBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }

    // Verifica a sessão ao carregar a página (já atualiza isLoggedIn)
    await checkSession();
    
    // Sincroniza carrinho se estiver logado
    if (isLoggedIn) {
        // Mescla carrinho local com o do servidor (primeira vez após login)
        await mergeCartAfterLogin();
    }
    
    // Escuta mudanças na visibilidade da página para sincronizar quando voltar
    document.addEventListener('visibilitychange', async () => {
        if (!document.hidden && isLoggedIn) {
            // Quando a página volta a ficar visível, sincroniza o carrinho
            await syncCartFromServer();
        }
    });
    
    // Sincroniza também quando a página recebe foco (útil para janelas anônimas)
    window.addEventListener('focus', async () => {
        if (isLoggedIn) {
            await checkSession();
            if (isLoggedIn) {
                await syncCartFromServer();
            }
        }
    });

    // Lógica de logout
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            // Atualiza status de login
            isLoggedIn = false;
            
            sessionMessage.innerText = data.message;
            sessionMessage.classList.remove('text-danger');
            sessionMessage.classList.add('text-success');
            // Atualiza a interface após logout
            await checkSession();
        } catch (err) {
            isLoggedIn = false;
            sessionMessage.innerText = 'Erro ao fazer logout.';
            sessionMessage.classList.add('text-danger');
        }
    });

    // =================== SISTEMA DE CARRINHO ===================
    
    // Função para obter carrinho do localStorage
    function getCartFromLocalStorage() {
        const cart = localStorage.getItem('carrinho');
        return cart ? JSON.parse(cart) : [];
    }

    // Função para salvar carrinho no localStorage
    function saveCartToLocalStorage(cart) {
        localStorage.setItem('carrinho', JSON.stringify(cart));
    }

    // Função para sincronizar carrinho do servidor
    async function syncCartFromServer() {
        if (!isLoggedIn) return;
        
        try {
            const response = await fetch('/api/carrinho', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const serverCart = await response.json();
                // Converte formato do servidor para formato do frontend
                const cart = serverCart.map(item => ({
                    id_produto: item.id_produto,
                    quantidade: item.quantidade,
                    imagem: item.imagem,
                    descricao: item.descricao,
                    marca: item.marca,
                    tamanho: item.tamanho,
                    preco: item.preco,
                    categoria: item.categoria
                }));
                // Atualiza localStorage com dados do servidor
                saveCartToLocalStorage(cart);
                updateCartUI();
                console.log('Carrinho sincronizado do servidor');
            }
        } catch (err) {
            console.error('Erro ao sincronizar carrinho do servidor:', err);
        }
    }

    // Função para mesclar carrinho local com o do servidor (após login)
    async function mergeCartAfterLogin() {
        if (!isLoggedIn) return;
        
        const localCart = getCartFromLocalStorage();
        
        try {
            // Primeiro, busca o carrinho do servidor
            const response = await fetch('/api/carrinho', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const serverCart = await response.json();
                
                // Se há itens no servidor, sempre prioriza o servidor
                if (serverCart && serverCart.length > 0) {
                    // Converte formato do servidor para formato do frontend
                    const cart = serverCart.map(item => ({
                        id_produto: item.id_produto,
                        quantidade: item.quantidade,
                        imagem: item.imagem,
                        descricao: item.descricao,
                        marca: item.marca,
                        tamanho: item.tamanho,
                        preco: item.preco,
                        categoria: item.categoria
                    }));
                    // Atualiza localStorage com dados do servidor
                    saveCartToLocalStorage(cart);
                    updateCartUI();
                    console.log('Carrinho do servidor carregado:', cart.length, 'itens');
                } else if (localCart.length > 0) {
                    // Se servidor está vazio mas há itens locais, envia para o servidor
                    const serverCartMap = new Map();
                    
                    // Adiciona itens do localStorage ao servidor
                    for (const localItem of localCart) {
                        await fetch('/api/carrinho', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id_produto: localItem.id_produto,
                                quantidade: localItem.quantidade
                            })
                        });
                    }
                    
                    // Recarrega do servidor após adicionar
                    await syncCartFromServer();
                    console.log('Carrinho local enviado para o servidor');
                }
            }
        } catch (err) {
            console.error('Erro ao mesclar carrinho:', err);
            // Em caso de erro, mantém o carrinho local
        }
    }

    // Função para adicionar produto ao carrinho
    async function addToCart(produto) {
        if (isLoggedIn) {
            // Se logado, salva no servidor
            try {
                const response = await fetch('/api/carrinho', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_produto: produto.id_produto,
                        quantidade: 1
                    })
                });
                
                if (response.ok) {
                    // Atualiza do servidor após adicionar
                    await syncCartFromServer();
                    return;
                }
            } catch (err) {
                console.error('Erro ao adicionar ao carrinho no servidor:', err);
            }
        }
        
        // Fallback: salva no localStorage (usuário não logado ou erro)
        let cart = getCartFromLocalStorage();
        
        // Verifica se o produto já está no carrinho
        const existingItem = cart.find(item => item.id_produto === produto.id_produto);
        
        if (existingItem) {
            // Se já existe, aumenta a quantidade
            existingItem.quantidade += 1;
        } else {
            // Se não existe, adiciona com quantidade 1
            cart.push({
                ...produto,
                quantidade: 1
            });
        }
        
        saveCartToLocalStorage(cart);
        updateCartUI();
    }

    // Função para remover produto do carrinho
    async function removeFromCart(idProduto) {
        if (isLoggedIn) {
            // Se logado, remove do servidor
            try {
                const response = await fetch('/api/carrinho', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_produto: idProduto })
                });
                
                if (response.ok) {
                    // Atualiza do servidor após remover
                    await syncCartFromServer();
                    return;
                }
            } catch (err) {
                console.error('Erro ao remover do carrinho no servidor:', err);
            }
        }
        
        // Fallback: remove do localStorage
        let cart = getCartFromLocalStorage();
        cart = cart.filter(item => item.id_produto !== idProduto);
        saveCartToLocalStorage(cart);
        updateCartUI();
    }

    // Função para atualizar quantidade do produto
    async function updateQuantity(idProduto, quantidade) {
        if (isLoggedIn) {
            // Se logado, atualiza no servidor
            try {
                const response = await fetch('/api/carrinho', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_produto: idProduto,
                        quantidade: quantidade
                    })
                });
                
                if (response.ok) {
                    // Atualiza do servidor após atualizar
                    await syncCartFromServer();
                    return;
                }
            } catch (err) {
                console.error('Erro ao atualizar carrinho no servidor:', err);
            }
        }
        
        // Fallback: atualiza no localStorage
        let cart = getCartFromLocalStorage();
        const item = cart.find(item => item.id_produto === idProduto);
        
        if (item) {
            if (quantidade <= 0) {
                removeFromCart(idProduto);
            } else {
                item.quantidade = quantidade;
            }
        }
        
        saveCartToLocalStorage(cart);
        updateCartUI();
    }

    // Função para calcular total do carrinho
    function calculateTotal() {
        const cart = getCartFromLocalStorage();
        let total = 0;
        
        cart.forEach(item => {
            // Remove formatação do preço (R$ 40,00 -> 40.00)
            const preco = parseFloat(item.preco.replace('R$', '').replace(/\./g, '').replace(',', '.'));
            total += preco * item.quantidade;
        });
        
        return total;
    }

    // Função para atualizar a UI do carrinho
    function updateCartUI() {
        const cart = getCartFromLocalStorage();
        const cartContainer = document.querySelector('.offcanvas-body');
        const qtyInfo = document.querySelector('.qty-info');
        
        // Atualiza quantidade no ícone
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantidade, 0);
        if (qtyInfo) {
            qtyInfo.textContent = totalQuantity;
            qtyInfo.style.display = totalQuantity > 0 ? 'block' : 'none';
        }
        
        // Limpa o container
        cartContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p class="text-center mt-4">Seu carrinho está vazio.</p>';
            return;
        }
        
        // Adiciona cada item do carrinho
        cart.forEach((item, index) => {
            const itemHTML = `
                <div class="item-offcanvas mb-4" id="item-cart-${item.id_produto}">
                    <img src="${item.imagem}" alt="${item.descricao}" class="img-fluid" style="max-width: 100px;">
                    <div class="info-item-cart">
                        <h3>${item.descricao}</h3>
                        <p class="price-item-cart">${item.preco}</p>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <label>Quantidade:</label>
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantityValue(${item.id_produto}, -1)">-</button>
                            <span>${item.quantidade}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantityValue(${item.id_produto}, 1)">+</button>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="removeFromCartById(${item.id_produto})">Remover</button>
                    </div>
                </div>
            `;
            cartContainer.innerHTML += itemHTML;
        });
        
        // Adiciona total
        const total = calculateTotal();
        cartContainer.innerHTML += `
            <hr>
            <p class="fw-bold fs-5">
                Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
        `;
        
        // Botão para comprar todos os itens
        cartContainer.innerHTML += `
            <button type="button" class="btn btn-offcanvas buy-all-itens" id="btn-comprar-todos" style="display: block; width: 100%;">
                Comprar todos os itens
            </button>
        `;
        
        // Adiciona event listener ao botão de comprar
        const btnComprarTodos = document.getElementById('btn-comprar-todos');
        if (btnComprarTodos) {
            // Usa onclick direto para evitar problemas com múltiplos event listeners
            btnComprarTodos.onclick = async function() {
                // Verifica se há itens no carrinho
                const currentCart = getCartFromLocalStorage();
                if (currentCart.length === 0) {
                    alert('Seu carrinho está vazio. Adicione produtos antes de continuar.');
                    return;
                }
                
                // Verifica o status de login antes de redirecionar
                await checkSession();
                
                // Verifica se o usuário está logado
                if (!isLoggedIn) {
                    if (confirm('Você precisa estar logado para continuar com a compra. Deseja fazer login agora?')) {
                        window.location.href = '/entrar';
                    }
                    return;
                }
                
                // Redireciona para a página de checkout (informações)
                window.location.href = '/checkout';
            };
        }
    }

    // Expor funções globalmente para poder chamar dos botões
    window.addToCartById = function(idProduto, produtos) {
        const produto = produtos.find(p => p.id_produto === idProduto);
        if (produto) {
            addToCart(produto);
        }
    };

    window.removeFromCartById = function(idProduto) {
        removeFromCart(idProduto);
    };

    window.updateQuantityValue = async function(idProduto, change) {
        const cart = getCartFromLocalStorage();
        const item = cart.find(item => item.id_produto === idProduto);
        if (item) {
            await updateQuantity(idProduto, item.quantidade + change);
        }
    };

    // Carrega os produtos
    async function carregarProdutos() {
        try {
            console.log('Carregando produtos...');
            
            if (!cardsContainer) {
                console.error('Container de produtos não encontrado!');
                return;
            }

            const response = await fetch('/api/produtos', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const produtos = await response.json();
            console.log(`Produtos carregados: ${produtos.length}`);

            // Verifica se há produtos
            if (!produtos || produtos.length === 0) {
                cardsContainer.innerHTML = '<p class="text-center">Nenhum produto disponível no momento.</p>';
                return;
            }

            // Limpa o contêiner
            cardsContainer.innerHTML = '';

            // Gera um card para cada produto
            produtos.forEach(produto => {
                const card = document.createElement('div');
                card.className = 'card';
                
                // Placeholder SVG inline para evitar requisições desnecessárias
                const placeholderSVG = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Crect fill=\'%23ddd\' width=\'300\' height=\'300\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'18\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3ESem imagem%3C/text%3E%3C/svg%3E';
                
                // Garante que o caminho da imagem está correto
                const imagemPath = produto.imagem || placeholderSVG;
                
                // Cria a imagem com tratamento de erro que evita loop infinito
                const img = document.createElement('img');
                img.src = imagemPath;
                img.alt = produto.descricao || 'Produto';
                img.className = 'imagem-produto';
                
                // Tratamento de erro que evita loop infinito
                let erroCount = 0;
                img.onerror = function() {
                    erroCount++;
                    // Se falhar e ainda não tiver usado o placeholder, usa o placeholder
                    if (erroCount === 1 && this.src !== placeholderSVG) {
                        this.src = placeholderSVG;
                    } else {
                        // Se já tentou o placeholder ou já tentou antes, oculta a imagem
                        this.style.display = 'none';
                    }
                };
                
                card.innerHTML = `
                    <p>${produto.descricao || 'Sem descrição'}</p>
                    <span class="categoria">${produto.categoria || 'Sem categoria'}</span>
                    <p class="preco">${produto.preco || 'R$0,00'}</p>
                    <button onclick="addToCartById(${produto.id_produto}, produtosData)" class="btn-card-produto">Comprar Agora</button>
                `;
                
                // Insere a imagem no início do card
                card.insertBefore(img, card.firstChild);
                cardsContainer.appendChild(card);
            });

            // Salvar produtos globalmente para poder acessar nos botões
            window.produtosData = produtos;
            console.log('Produtos renderizados com sucesso!');

            // Atualiza a UI do carrinho
            updateCartUI();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            if (cardsContainer) {
                cardsContainer.innerHTML = '<p class="text-danger text-center">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
            }
        }
    }

    // Chama a função para carregar produtos
    carregarProdutos();
});