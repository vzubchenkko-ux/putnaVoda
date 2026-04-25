// Функція для показу повідомлень
export function showMessage(message, isError = false) {
    let messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        messageContainer.style.position = 'fixed';
        messageContainer.style.bottom = '20px';
        messageContainer.style.left = '50%';
        messageContainer.style.transform = 'translateX(-50%)';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.width = '100%';
        messageContainer.style.maxWidth = '600px';
        messageContainer.style.textAlign = 'center';
        document.body.appendChild(messageContainer);
    }

    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.style.padding = '15px 20px';
    messageBox.style.marginBottom = '10px';
    messageBox.style.backgroundColor = isError ? '#ffebee' : '#e8f5e9';
    messageBox.style.border = `1px solid ${isError ? '#ffcdd2' : '#c8e6c9'}`;
    messageBox.style.borderRadius = '4px';
    messageBox.style.color = isError ? '#c62828' : '#2e7d32';
    messageBox.style.fontFamily = 'Arial, sans-serif';
    messageBox.style.fontSize = '16px';
    messageBox.style.fontWeight = 'normal';
    messageBox.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

    messageContainer.insertBefore(messageBox, messageContainer.firstChild);

    setTimeout(() => {
        messageBox.style.opacity = '0';
        messageBox.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            messageBox.remove();
            if (messageContainer.children.length === 0) {
                messageContainer.remove();
            }
        }, 500);
    }, 3000);
}

// Функція для перевірки авторизації
export function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Функція для перевірки ролі адміністратора
export function checkAdminRole() {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        window.location.href = 'kursova.html';
        return false;
    }
    return true;
}

// Функція для форматування дати
export function formatDate(date) {
    return new Date(date).toLocaleString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Функція для форматування ціни
export function formatPrice(price) {
    return parseFloat(price).toFixed(2) + ' грн';
} 