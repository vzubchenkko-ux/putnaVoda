document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadOrderHistory();
    setupEventListeners();
});

function setupEventListeners() {
    // Обробка редагування профілю
    const editBtn = document.getElementById('editProfileBtn');
    const form = document.getElementById('profileForm');
    const formButtons = document.querySelector('.form-buttons');
    const cancelBtn = document.querySelector('.cancel-button');
    const inputs = form.querySelectorAll('input');
    
    editBtn.addEventListener('click', () => {
        inputs.forEach(input => input.disabled = false);
        formButtons.style.display = 'flex';
        editBtn.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        inputs.forEach(input => input.disabled = true);
        formButtons.style.display = 'none';
        editBtn.style.display = 'block';
        loadUserProfile(); // Перезавантажуємо дані профілю
    });
    
    // Обробка виходу з акаунту
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    const cancelLogoutBtn = document.getElementById('cancelLogout');
    
    logoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'flex';
    });
    
    confirmLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
    
    cancelLogoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });
    
    // Закриття модального вікна при кліку поза ним
    window.addEventListener('click', (e) => {
        if (e.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });
    
    // Обробка форми профілю
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });
}

async function loadUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Помилка завантаження профілю');

        const data = await response.json();
        if (data.success) {
            document.getElementById('firstName').value = data.user.firstName || '';
            document.getElementById('lastName').value = data.user.lastName || '';
            document.getElementById('email').value = data.user.email || '';
            document.getElementById('dob').value = data.user.dob || '';
        }
    } catch (error) {
        showMessage('Помилка завантаження профілю', true);
    }
}

async function loadOrderHistory() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/orders/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Помилка завантаження замовлень');

        const data = await response.json();
        displayOrders(data.orders);
    } catch (error) {
        showMessage('Помилка завантаження історії замовлень', true);
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    const noOrdersMessage = document.querySelector('.no-orders-message');

    if (!orders || orders.length === 0) {
        if (noOrdersMessage) noOrdersMessage.style.display = 'block';
        return;
    }

    if (noOrdersMessage) noOrdersMessage.style.display = 'none';
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3>Замовлення #${order.id}</h3>
                    <p class="order-date">
                        Створено: ${new Date(order.order_date).toLocaleString('uk-UA')}
                    </p>
                    <p class="pickup-date">
                        Дата отримання: ${new Date(order.pickup_datetime).toLocaleString('uk-UA')}
                    </p>
                </div>
                <div class="order-status ${order.status}">
                    ${getStatusText(order.status)}
                </div>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-details">
                            ${item.size ? `${item.size}л - ` : ''}
                            ${item.quantity} шт. x ${item.price} грн
                        </span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-footer">
                <div class="payment-info">
                    <p>Спосіб оплати: ${getPaymentTypeText(order.payment_type)}</p>
                    <p>Статус оплати: ${getPaymentStatusText(order.payment_status)}</p>
                </div>
                <div class="total-amount">
                    <p>До сплати: ${order.payment_amount} грн</p>
                    <p>Всього: ${order.total_amount} грн</p>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statuses = {
        'new': 'Нове',
        'processing': 'В обробці',
        'ready': 'Готове до видачі',
        'completed': 'Завершене',
        'cancelled': 'Скасоване'
    };
    return statuses[status] || status;
}

function getPaymentTypeText(type) {
    const types = {
        'card': 'Карткою',
        'apple_pay': 'Apple Pay',
        'google_pay': 'Google Pay'
    };
    return types[type] || type;
}

function getPaymentStatusText(status) {
    const statuses = {
        'pending': 'Очікує оплати',
        'paid': 'Оплачено',
        'failed': 'Помилка оплати'
    };
    return statuses[status] || status;
}

async function updateProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        dob: document.getElementById('dob').value
    };

    try {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Помилка оновлення профілю');

        const data = await response.json();
        if (data.success) {
            showMessage('Профіль успішно оновлено');
            // Повертаємо форму в режим перегляду
            document.querySelectorAll('#profileForm input').forEach(input => input.disabled = true);
            document.querySelector('.form-buttons').style.display = 'none';
            document.getElementById('editProfileBtn').style.display = 'block';
        }
    } catch (error) {
        showMessage('Помилка оновлення профілю', true);
    }
}

function showMessage(message, isError = false) {
    const messageElement = document.createElement('div');
    messageElement.className = isError ? 'error-message' : 'success-message';
    messageElement.innerHTML = `
        <i class="fas fa-${isError ? 'exclamation-circle' : 'check-circle'}"></i>
        <p>${message}</p>
    `;
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
} 