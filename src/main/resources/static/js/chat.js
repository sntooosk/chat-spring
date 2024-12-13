let currentChatUser = null;
const user = JSON.parse(localStorage.getItem('user'));
const currentUsername = user ? user.username : null;

document.addEventListener('DOMContentLoaded', () => {
    // Se o usuário não estiver logado, redireciona para o login
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const chatBox = document.getElementById('chatBox');
    const userList = document.getElementById('userList');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('message');
    const emojiButton = document.getElementById('emoji-button');
    const emojiPicker = document.getElementById('emoji-picker');

    // Iniciar conversa privada com usuário
    userList.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const username = event.target.previousSibling.textContent.trim();
            startPrivateChat(username);
        }
    });

    function startPrivateChat(username) {
        currentChatUser = username;
        chatBox.innerHTML = ''; // Limpar o chat atual
        loadPrivateMessages(currentUsername, currentChatUser);
        document.querySelector('.chat-column h1').innerText = `Conversando com ${currentChatUser}`;
    }

    async function loadPrivateMessages(sender, recipient) {
        try {
            const response = await fetch(`/api/messages/private/${sender}/${recipient}`);
            if (!response.ok) throw new Error('Falha ao carregar mensagens privadas');
            const messages = await response.json();
            messages.forEach(appendMessage);
        } catch (error) {
            console.error('Erro ao buscar mensagens privadas:', error);
        }
    }

    // Alternar exibição do seletor de emojis
    emojiButton.addEventListener('click', () => {
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
    });

    // Adicionar emoji no campo de mensagem
    emojiPicker.addEventListener('emoji-click', (event) => {
        const emoji = event.detail.unicode;
        messageInput.value += emoji;
        emojiPicker.style.display = 'none';
    });

    // Exibir mensagens
    function appendMessage(message) {
        if (message.recipient) {
            if (
                (message.sender === currentUsername && message.recipient === currentChatUser) ||
                (message.sender === currentChatUser && message.recipient === currentUsername)
            ) {
                displayMessage(message);
            }
        } else {
            if (!currentChatUser) {
                displayMessage(message);
            }
        }
    }

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('mb-2');
        messageElement.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${message.profilePicture}" alt="Profile" class="rounded-circle mr-2" style="width: 30px; height: 30px;">
                <strong>${message.sender}</strong> <small class="text-muted ml-2">${message.time}</small>
            </div>
            <div>${message.text}</div>
        `;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Rolagem automática
    }

    // Carregar usuários na lista
    async function loadUsers() {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Falha ao carregar usuários');
            const users = await response.json();
            users.forEach(user => {
                const userItem = document.createElement('li');
                userItem.classList.add('list-group-item');
                userItem.innerHTML = `
                    ${user.username}
                    <button class="btn btn-primary btn-sm ml-2">Conversar</button>
                `;
                userList.appendChild(userItem);
            });
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    }

    // Conexão WebSocket
    const sock = new SockJS('/chat-websocket');
    const stompClient = new StompJs.Client({
        webSocketFactory: () => sock,
        onConnect: (frame) => {
            console.log('Conectado:', frame);
            stompClient.subscribe('/topic/messages', (message) => {
                appendMessage(JSON.parse(message.body));
            });
            stompClient.subscribe(`/user/${user.username}/queue/private`, (message) => {
                appendMessage(JSON.parse(message.body));
            });
        },
        onWebSocketError: (error) => {
            console.error('Erro com o WebSocket:', error);
        },
        onStompError: (frame) => {
            console.error('Erro no STOMP: ' + frame.headers['message']);
        }
    });
    stompClient.activate();

    // Enviar mensagem
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const messageContent = messageInput.value.trim();
        if (messageContent && stompClient.connected) {
            const message = {
                sender: user.username,
                text: messageContent,
                profilePicture: user.profilePictureUrl,
                recipient: currentChatUser || null
            };

            if (currentChatUser) {
                stompClient.publish({
                    destination: `/app/private/${currentChatUser}`,
                    body: JSON.stringify(message)
                });
            } else {
                stompClient.publish({
                    destination: '/app/send',
                    body: JSON.stringify(message)
                });
            }

            appendMessage({
                ...message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            messageInput.value = ''; // Limpar campo de mensagem
        }
    });

    loadUsers();  // Carregar lista de usuários
    loadMessages();  // Carregar mensagens iniciais

});
