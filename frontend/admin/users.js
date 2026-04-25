import { showMessage } from '../utils.js';

// Функція для показу управління користувачами
export function showUsersManagement() {
    const usersModal = createUsersModal();
    document.body.appendChild(usersModal);
    fetchUsers();
}

// Створення модального вікна для користувачів
function createUsersModal() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Управління користувачами</h3>
            <div id="usersList">Завантаження користувачів...</div>
            <button class="close-modal">Закрити</button>
        </div>
    `;

    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    return modal;
}

// Отримання списку користувачів
async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Помилка завантаження користувачів:', error);
        showMessage('Помилка завантаження користувачів', true);
    }
}

// Відображення списку користувачів
function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    if (!users.length) {
        usersList.innerHTML = '<p>Немає користувачів</p>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-item">
            <h4>${user.email}</h4>
            <p>Роль: ${user.role}</p>
            ${user.role !== 'admin' ? `
                <button onclick="updateUserRole('${user.id}', 'seller')" class="admin-button">
                    ${user.role === 'seller' ? 'Забрати роль продавця' : 'Зробити продавцем'}
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Оновлення ролі користувача
export async function updateUserRole(userId, newRole) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });

        if (response.ok) {
            showMessage('Роль користувача успішно оновлено');
            fetchUsers();
        } else {
            throw new Error('Помилка оновлення ролі користувача');
        }
    } catch (error) {
        console.error('Помилка оновлення ролі:', error);
        showMessage('Помилка оновлення ролі користувача', true);
    }
} 