// Функція для перевірки чи є користувач адміністратором
function isAdmin() {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
}

// Функція для показу панелі адміністратора
function initializeAdminPanel() {
    if (!isAdmin()) {
        window.location.href = '/kursova.html';
        return;
    }

    const adminPanel = document.createElement('div');
    adminPanel.id = 'adminPanel';
    adminPanel.innerHTML = `
        <div class="admin-panel">
            <h2>Панель адміністратора</h2>
            <div class="admin-sections">
                <div class="admin-section">
                    <h3>Управління замовленнями</h3>
                    <button id="viewOrders">Переглянути замовлення</button>
                </div>
                <div class="admin-section">
                    <h3>Управління користувачами</h3>
                    <button id="manageUsers">Управління користувачами</button>
                </div>
                <div class="admin-section">
                    <h3>Управління товарами</h3>
                    <button id="manageProducts">Управління товарами</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertBefore(adminPanel, document.body.firstChild);
    initializeEventListeners();
}

// Ініціалізація обробників подій
function initializeEventListeners() {
    document.getElementById('viewOrders').addEventListener('click', () => {
        import('./orders.js').then(module => {
            module.showOrdersManagement();
        });
    });

    document.getElementById('manageUsers').addEventListener('click', () => {
        import('./users.js').then(module => {
            module.showUsersManagement();
        });
    });

    document.getElementById('manageProducts').addEventListener('click', () => {
        import('./products.js').then(module => {
            module.showProductsManagement();
        });
    });
}

// Експорт функцій
export { isAdmin, initializeAdminPanel }; 