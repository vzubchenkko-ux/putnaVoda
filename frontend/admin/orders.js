import { showMessage } from '../utils.js';

// Функція для показу управління замовленнями
export function showOrdersManagement() {
    const ordersModal = createOrdersModal();
    document.body.appendChild(ordersModal);
    fetchOrders();
}

// Створення модального вікна для замовлень
function createOrdersModal() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Управління замовленнями</h3>
            <div class="orders-filter">
                <select id="orderStatusFilter">
                    <option value="all">Всі замовлення</option>
                    <option value="new">Нові</option>
                    <option value="processing">В обробці</option>
                    <option value="completed">Виконані</option>
                    <option value="cancelled">Скасовані</option>
                </select>
            </div>
            <div id="ordersList">Завантаження замовлень...</div>
            <button class="close-modal">Закрити</button>
        </div>
    `;

    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#orderStatusFilter').addEventListener('change', (e) => {
        fetchOrders(e.target.value);
    });

    return modal;
}

// Отримання списку замовлень
async function fetchOrders(status = 'all') {
    try {
        const url = status === 'all' 
            ? 'http://localhost:3000/api/orders'
            : `http://localhost:3000/api/orders?status=${status}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Помилка завантаження замовлень:', error);
        showMessage('Помилка завантаження замовлень', true);
    }
}

// Відображення списку замовлень
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!orders.length) {
        ordersList.innerHTML = '<p>Немає замовлень</p>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-item ${order.status}">
            <div class="order-header">
                <h4>Замовлення #${order.id}</h4>
                <span class="order-date">${new Date(order.date).toLocaleString()}</span>
            </div>
            <div class="order-details">
                <p><strong>Клієнт:</strong> ${order.userName}</p>
                <p><strong>Email:</strong> ${order.userEmail}</p>
                <p><strong>Телефон:</strong> ${order.phone}</p>
                <p><strong>Адреса:</strong> ${order.address}</p>
                <p><strong>Статус:</strong> ${getStatusText(order.status)}</p>
            </div>
            <div class="order-items">
                <h5>Товари:</h5>
                <ul>
                    ${order.items.map(item => `
                        <li>
                            ${item.name} - ${item.quantity} шт. x ${item.price} = ${item.quantity * parseFloat(item.price)} грн
                        </li>
                    `).join('')}
                </ul>
                <p class="order-total"><strong>Всього:</strong> ${calculateOrderTotal(order.items)} грн</p>
            </div>
            <div class="order-actions">
                ${getOrderActions(order.status)}
            </div>
        </div>
    `).join('');

    // Додаємо обробники подій для кнопок
    addOrderActionHandlers();
}

// Отримання тексту статусу
function getStatusText(status) {
    const statuses = {
        'new': 'Нове',
        'processing': 'В обробці',
        'completed': 'Виконано',
        'cancelled': 'Скасовано'
    };
    return statuses[status] || status;
}

// Отримання кнопок дій для замовлення
function getOrderActions(status) {
    switch (status) {
        case 'new':
            return `
                <button class="admin-button" data-action="process">Прийняти в обробку</button>
                <button class="admin-button delete" data-action="cancel">Скасувати</button>
            `;
        case 'processing':
            return `
                <button class="admin-button" data-action="complete">Позначити як виконане</button>
                <button class="admin-button delete" data-action="cancel">Скасувати</button>
            `;
        case 'completed':
            return '';
        case 'cancelled':
            return '';
        default:
            return '';
    }
}

// Підрахунок загальної суми замовлення
function calculateOrderTotal(items) {
    return items.reduce((total, item) => {
        return total + (item.quantity * parseFloat(item.price));
    }, 0).toFixed(2);
}

// Додавання обробників подій для кнопок
function addOrderActionHandlers() {
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', async (e) => {
            const action = e.target.dataset.action;
            const orderId = e.target.closest('.order-item').dataset.id;
            await updateOrderStatus(orderId, action);
        });
    });
}

// Оновлення статусу замовлення
export async function updateOrderStatus(orderId, action) {
    const statusMap = {
        'process': 'processing',
        'complete': 'completed',
        'cancel': 'cancelled'
    };

    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: statusMap[action] })
        });

        if (response.ok) {
            showMessage('Статус замовлення успішно оновлено');
            fetchOrders(document.getElementById('orderStatusFilter').value);
        } else {
            throw new Error('Помилка оновлення статусу замовлення');
        }
    } catch (error) {
        console.error('Помилка оновлення статусу:', error);
        showMessage('Помилка оновлення статусу замовлення', true);
    }
} 