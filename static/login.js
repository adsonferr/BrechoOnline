document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("login-message");
    const welcomeMessage = document.getElementById("welcome-message");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const pageTitle = document.getElementById("page-title");

    // Função para verificar o status da sessão
    async function checkSession() {
        try {
            const response = await fetch("/check-session", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            if (data.logged_in) {
                // Usuário está logado
                welcomeMessage.innerText = `Bem-vindo, ${data.user_email}!`;
                welcomeMessage.style.display = "block";
                form.style.display = "none"; // Esconde o formulário
                loginBtn.style.display = "none"; // Esconde o botão de login
                logoutBtn.style.display = "block"; // Mostra o botão de logout
                pageTitle.innerText = "Bem-vindo!";
            } else {
                // Usuário não está logado
                welcomeMessage.style.display = "none";
                form.style.display = "block"; // Mostra o formulário
                loginBtn.style.display = "block"; // Mostra o botão de login
                logoutBtn.style.display = "none"; // Esconde o botão de logout
                pageTitle.innerText = "Faça seu login";
            }
        } catch (err) {
            console.error("Erro ao verificar sessão:", err);
            welcomeMessage.style.display = "none";
            form.style.display = "block";
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
            pageTitle.innerText = "Faça seu login";
        }
    }

    // Verifica a sessão ao carregar a página
    checkSession();

    // Lógica de login
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                message.innerText = "✅ Login realizado com sucesso!";
                message.classList.remove("text-danger");
                message.classList.add("text-success");
                // Atualiza a interface após login
                checkSession();
                // Redireciona para a página inicial após 1 segundo
                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);
            } else {
                message.innerText = "❌ E-mail ou senha incorretos.";
                message.classList.remove("text-success");
                message.classList.add("text-danger");
            }
        } catch (err) {
            message.innerText = "Erro ao tentar logar.";
            message.classList.add("text-danger");
        }
    });

    // Lógica de logout
    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            message.innerText = data.message;
            message.classList.remove("text-danger");
            message.classList.add("text-success");
            // Atualiza a interface após logout
            checkSession();
        } catch (err) {
            message.innerText = "Erro ao fazer logout.";
            message.classList.add("text-danger");
        }
    });
});