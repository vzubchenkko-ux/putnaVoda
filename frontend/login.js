document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('messageBox');

    // Очищаємо дані попередньої сесії
    localStorage.clear();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Відповідь сервера:', data);

            if (response.ok) {
                // Зберігаємо дані користувача
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userEmail', data.user.email);

                showMessage(data.message);

                // Перевіряємо роль та перенаправляємо
                if (data.user.role === 'admin') {
                    window.location.replace('admin-account.html');
                } else {
                    window.location.replace('account.html');
                }
            } else {
                showMessage(data.message || 'Помилка входу', true);
            }
        } catch (error) {
            console.error('Помилка:', error);
            showMessage('Помилка сервера. Спробуйте пізніше.', true);
        }
    });
});

function showMessage(message, isError = false) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message ${isError ? 'error' : 'success'}`;
    messageBox.style.display = 'block';
    
    if (!isError) {
        messageBox.style.backgroundColor = '#4CAF50';
        messageBox.style.color = 'white';
    } else {
        messageBox.style.backgroundColor = '#f44336';
        messageBox.style.color = 'white';
    }
    
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 2000);
} 