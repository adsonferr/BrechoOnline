document.addEventListener('DOMContentLoaded', async () => {
    const cardsContainer = document.getElementById('cards-produtos');
    const sessionMessage = document.getElementById('session-message');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');

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
            sessionMessage.innerText = 'Erro ao verificar sessão.';
            sessionMessage.classList.add('text-danger');
            registerBtn.style.display = 'inline-block';
            loginBtn.style.display = 'inline-block';
            dashboardBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }

    // Verifica a sessão ao carregar a página
    await checkSession();

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

            sessionMessage.innerText = data.message;
            sessionMessage.classList.remove('text-danger');
            sessionMessage.classList.add('text-success');
            // Atualiza a interface após logout
            await checkSession();
        } catch (err) {
            sessionMessage.innerText = 'Erro ao fazer logout.';
            sessionMessage.classList.add('text-danger');
        }
    });

    // =================== SISTEMA DE CARRINHO ===================
    
    // Função para obter carrinho do localStorage
    function getCart() {
        const cart = localStorage.getItem('carrinho');
        return cart ? JSON.parse(cart) : [];
    }

    // Função para salvar carrinho no localStorage
    function saveCart(cart) {
        localStorage.setItem('carrinho', JSON.stringify(cart));
    }

    // Função para adicionar produto ao carrinho
    function addToCart(produto) {
        let cart = getCart();
        
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
        
        saveCart(cart);
        updateCartUI();
    }

    // Função para remover produto do carrinho
    function removeFromCart(idProduto) {
        let cart = getCart();
        cart = cart.filter(item => item.id_produto !== idProduto);
        saveCart(cart);
        updateCartUI();
    }

    // Função para atualizar quantidade do produto
    function updateQuantity(idProduto, quantidade) {
        let cart = getCart();
        const item = cart.find(item => item.id_produto === idProduto);
        
        if (item) {
            if (quantidade <= 0) {
                removeFromCart(idProduto);
            } else {
                item.quantidade = quantidade;
            }
        }
        
        saveCart(cart);
        updateCartUI();
    }

    // Função para calcular total do carrinho
    function calculateTotal() {
        const cart = getCart();
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
        const cart = getCart();
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
            <a href="#" class="btn btn-offcanvas buy-all-itens" style="display: block; width: 100%;">
                Comprar todos os itens
            </a>
        `;
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

    window.updateQuantityValue = function(idProduto, change) {
        const cart = getCart();
        const item = cart.find(item => item.id_produto === idProduto);
        if (item) {
            updateQuantity(idProduto, item.quantidade + change);
        }
    };

    // Carrega os produtos
    try {
        const response = await fetch('/api/produtos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar produtos');
        }

        const produtos = await response.json();

        // Limpa o contêiner
        cardsContainer.innerHTML = '';

        // Gera um card para cada produto
        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${produto.imagem || '/static/Imgs/placeholder.png'}" alt="${produto.descricao}" class="imagem-produto" />
                <p>${produto.descricao}</p>
                <span class="categoria">${produto.categoria}</span>
                <p class="preco">${produto.preco}</p>
                <button onclick="addToCartById(${produto.id_produto}, produtosData)" class="btn-card-produto">Comprar Agora</button>
            `;
            cardsContainer.appendChild(card);
        });

        // Salvar produtos globalmente para poder acessar nos botões
        window.produtosData = produtos;

        // Atualiza a UI do carrinho
        updateCartUI();
    } catch (error) {
        console.error('Erro:', error);
        cardsContainer.innerHTML = '<p class="text-danger">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
    }
});