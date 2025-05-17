document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Evita o envio tradicional do formulário

    // Obtém os valores dos campos
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const privacyTerms = document.getElementById('privacyTerms').checked;

    // Elemento para mensagens de erro (opcional, requer HTML)
    const errorMessage = document.getElementById('error-message') || document.createElement('div');

    // Valida apenas os termos de privacidade
    if (!privacyTerms) {
        errorMessage.textContent = 'Você precisa aceitar os termos de privacidade.';
        alert('Você precisa aceitar os termos de privacidade.');
        return;
    }

    // Monta o objeto de dados (sem advertising, pois não é usado)
    const formData = {
        name,
        email,
        password,
        confirmPassword
    };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json(); // Parseia como JSON

        // Exibe a mensagem (sucesso ou erro) da chave 'message'
        const message = result.message || 'Erro desconhecido.';
        errorMessage.textContent = message; // Atualiza o elemento de erro, se existir
        alert(message); // Exibe no alert

        if (response.ok) {
            // Sucesso: redireciona para login
            window.location.href = '/entrar';
        }
    } catch (error) {
        // Erro de rede ou outro
        const errorText = 'Erro ao conectar com o servidor: ' + error.message;
        errorMessage.textContent = errorText;
        alert(errorText);
    }
});