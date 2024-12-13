document.addEventListener('DOMContentLoaded', (event) => {
    const loginForm = document.getElementById('loginForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const profilePicture = document.getElementById('profilePicture').files[0];

        // Verificar se o nome de usuário e a foto foram preenchidos
        if (!username || !profilePicture) {
            errorMessage.textContent = 'Por favor, preencha todos os campos.';
            return;
        }

        // Verificar se o arquivo é uma imagem
        if (!profilePicture.type.startsWith('image/')) {
            errorMessage.textContent = 'Por favor, envie uma imagem válida como foto de perfil.';
            return;
        }

        const formData = new FormData();
        formData.append('file', profilePicture);

        // Exibir indicador de carregamento
        loadingIndicator.style.display = 'block';
        errorMessage.textContent = '';

        try {
            // Primeira requisição para enviar a imagem
            const uploadResponse = await fetch('/api/upload-profile-picture', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Erro ao fazer upload da foto de perfil.');
            }

            const uploadData = await uploadResponse.json();

            const user = {
                username: username,
                profilePictureUrl: uploadData.url
            };

            // Segunda requisição para criar o usuário
            const userResponse = await fetch('/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });

            if (!userResponse.ok) {
                throw new Error('Erro ao criar o usuário.');
            }

            const userData = await userResponse.json();
            localStorage.setItem('user', JSON.stringify(userData));

            // Redirecionar para a página do chat
            window.location.href = '/chat';
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = error.message || 'Ocorreu um erro, tente novamente mais tarde.';
        } finally {
            // Ocultar indicador de carregamento
            loadingIndicator.style.display = 'none';
        }
    });
});
