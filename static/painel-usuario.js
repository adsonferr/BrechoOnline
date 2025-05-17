document.addEventListener('DOMContentLoaded', async () => {
    const sessionMessage = document.getElementById('session-message');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutLink = document.getElementById('logout-link');

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
                sessionMessage.innerText = 'Você precisa estar logado para acessar esta página.';
                sessionMessage.classList.add('text-danger');
                registerBtn.style.display = 'inline-block';
                loginBtn.style.display = 'inline-block';
                dashboardBtn.style.display = 'none';
                logoutBtn.style.display = 'none';
                // Redireciona para a página de login após 2 segundos
                setTimeout(() => {
                    window.location.href = '/entrar';
                }, 2000);
            }
        } catch (err) {
            console.error('Erro ao verificar sessão:', err);
            sessionMessage.innerText = 'Erro ao verificar sessão.';
            sessionMessage.classList.add('text-danger');
            registerBtn.style.display = 'inline-block';
            loginBtn.style.display = 'inline-block';
            dashboardBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
            // Redireciona para a página de login após 2 segundos
            setTimeout(() => {
                window.location.href = '/entrar';
            }, 2000);
        }
    }

    // Verifica a sessão ao carregar a página
    await checkSession();

    // Função de logout
    async function handleLogout() {
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
    }

    // Lógica de logout para o botão na navbar
    logoutBtn.addEventListener('click', handleLogout);

    // Lógica de logout para o link no painel
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
});