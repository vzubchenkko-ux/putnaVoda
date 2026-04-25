import { showMessage } from '../utils.js';

// Функція для показу управління товарами
export function showProductsManagement() {
    const productsModal = createProductsModal();
    document.body.appendChild(productsModal);
    fetchProducts();
}

// Створення модального вікна для товарів
function createProductsModal() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Управління товарами</h3>
            <button id="addNewProduct" class="admin-button">Додати новий товар</button>
            <div id="productsList">Завантаження товарів...</div>
            <button class="close-modal">Закрити</button>
        </div>
    `;

    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#addNewProduct').addEventListener('click', showAddProductForm);

    return modal;
}

// Форма додавання нового товару
function showAddProductForm() {
    const formModal = document.createElement('div');
    formModal.className = 'admin-modal';
    formModal.innerHTML = `
        <div class="modal-content">
            <h3>Додати новий товар</h3>
            <form id="addProductForm">
                <div class="form-group">
                    <label for="productName">Назва товару:</label>
                    <input type="text" id="productName" required>
                </div>
                <div class="form-group">
                    <label for="productPrice">Ціна:</label>
                    <input type="number" id="productPrice" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="productDescription">Опис:</label>
                    <textarea id="productDescription" required></textarea>
                </div>
                <div class="form-group">
                    <label for="productImage">Фото товару:</label>
                    <input type="file" id="productImage" accept="image/*" required>
                </div>
                <div class="form-group">
                    <label for="productCategory">Категорія:</label>
                    <select id="productCategory" required>
                        <option value="water">Вода</option>
                        <option value="bottle">Тара</option>
                        <option value="accessory">Аксесуари</option>
                    </select>
                </div>
                <button type="submit" class="admin-button">Додати товар</button>
                <button type="button" class="close-modal">Скасувати</button>
            </form>
        </div>
    `;

    document.body.appendChild(formModal);

    const form = formModal.querySelector('#addProductForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddProduct(form);
        formModal.remove();
    });

    formModal.querySelector('.close-modal').addEventListener('click', () => formModal.remove());
}

// Отримання списку товарів
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Помилка завантаження товарів:', error);
        showMessage('Помилка завантаження товарів', true);
    }
}

// Додавання нового товару
async function handleAddProduct(form) {
    try {
        const formData = new FormData();
        formData.append('name', form.productName.value);
        formData.append('price', form.productPrice.value);
        formData.append('description', form.productDescription.value);
        formData.append('image', form.productImage.files[0]);
        formData.append('category', form.productCategory.value);

        const response = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            showMessage('Товар успішно додано');
            fetchProducts();
        } else {
            throw new Error('Помилка додавання товару');
        }
    } catch (error) {
        console.error('Помилка додавання товару:', error);
        showMessage('Помилка додавання товару', true);
    }
}

// Відображення списку товарів
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    if (!products.length) {
        productsList.innerHTML = '<p>Немає товарів</p>';
        return;
    }

    productsList.innerHTML = products.map(product => `
        <div class="product-item">
            <img src="/images/${product.image}" alt="${product.name}" style="max-width: 100px;">
            <h4>${product.name}</h4>
            <p>Ціна: ${product.price}</p>
            <button onclick="editProduct('${product.id}')" class="admin-button">
                Редагувати
            </button>
            <button onclick="deleteProduct('${product.id}')" class="admin-button delete">
                Видалити
            </button>
        </div>
    `).join('');
}

// Редагування товару
export async function editProduct(productId) {
    try {
        // Отримуємо дані про товар
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const product = await response.json();

        // Створюємо форму редагування
        const formModal = document.createElement('div');
        formModal.className = 'admin-modal';
        formModal.innerHTML = `
            <div class="modal-content">
                <h3>Редагувати товар</h3>
                <form id="editProductForm">
                    <div class="form-group">
                        <label for="productName">Назва товару:</label>
                        <input type="text" id="productName" value="${product.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="productPrice">Ціна:</label>
                        <input type="number" id="productPrice" step="0.01" value="${product.price}" required>
                    </div>
                    <div class="form-group">
                        <label for="productDescription">Опис:</label>
                        <textarea id="productDescription" required>${product.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="productImage">Нове фото товару (необов'язково):</label>
                        <input type="file" id="productImage" accept="image/*">
                        <img src="/images/${product.image}" alt="Поточне фото" style="max-width: 100px;">
                    </div>
                    <div class="form-group">
                        <label for="productCategory">Категорія:</label>
                        <select id="productCategory" required>
                            <option value="water" ${product.category === 'water' ? 'selected' : ''}>Вода</option>
                            <option value="bottle" ${product.category === 'bottle' ? 'selected' : ''}>Тара</option>
                            <option value="accessory" ${product.category === 'accessory' ? 'selected' : ''}>Аксесуари</option>
                        </select>
                    </div>
                    <button type="submit" class="admin-button">Зберегти зміни</button>
                    <button type="button" class="close-modal">Скасувати</button>
                </form>
            </div>
        `;

        document.body.appendChild(formModal);

        const form = formModal.querySelector('#editProductForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('name', form.productName.value);
            formData.append('price', form.productPrice.value);
            formData.append('description', form.productDescription.value);
            formData.append('category', form.productCategory.value);
            
            if (form.productImage.files[0]) {
                formData.append('image', form.productImage.files[0]);
            }

            try {
                const updateResponse = await fetch(`http://localhost:3000/api/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (updateResponse.ok) {
                    showMessage('Товар успішно оновлено');
                    fetchProducts();
                    formModal.remove();
                } else {
                    throw new Error('Помилка оновлення товару');
                }
            } catch (error) {
                console.error('Помилка оновлення товару:', error);
                showMessage('Помилка оновлення товару', true);
            }
        });

        formModal.querySelector('.close-modal').addEventListener('click', () => formModal.remove());
    } catch (error) {
        console.error('Помилка отримання даних товару:', error);
        showMessage('Помилка отримання даних товару', true);
    }
}

// Видалення товару
export async function deleteProduct(productId) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            showMessage('Товар успішно видалено');
            fetchProducts();
        } else {
            throw new Error('Помилка видалення товару');
        }
    } catch (error) {
        console.error('Помилка видалення товару:', error);
        showMessage('Помилка видалення товару', true);
    }
} 