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
                <a href="/produto/${produto.id_produto}" class="btn-card-produto">Comprar</a>
            `;
            cardsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Erro:', error);
        cardsContainer.innerHTML = '<p class="text-danger">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
    }
});