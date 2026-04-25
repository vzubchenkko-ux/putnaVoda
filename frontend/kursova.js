document.addEventListener("DOMContentLoaded", function () {
    const currentPage = window.location.pathname;
    console.log('Current page:', currentPage);
    
    const isWaterPage = currentPage.includes('voda.html');
    const isBottlePage = currentPage.includes('balon.html');
    const isAccessoriesPage = currentPage.includes('akcecyar.html');
    
    console.log('Is accessories page:', isAccessoriesPage);

    if (isWaterPage) {
        console.log('Rendering water page...');
        // === Вода pH ===
        setupCartLogic({
            key: 'ph-water',
            name: 'Вода pH',
            price: '1.50 грн/літр',
            image: 'ph.ipg.PNG',
            increaseBtnId: "increase-ph",
            decreaseBtnId: "decrease-ph",
            quantityElementId: "quantity-ph",
            cartToggleId: "toggle-ph",
            controlsBlockId: "quantity-controls-ph",
            addToCartId: "add-to-cart-ph"
        });

        // === Мінералізована вода ===
        setupCartLogic({
            key: 'mineral-water',
            name: 'Мінералізована вода',
            price: '1.50 грн/літр',
            image: 'min.jpg',
            increaseBtnId: "increase-mineral",
            decreaseBtnId: "decrease-mineral",
            quantityElementId: "quantity-mineral",
            cartToggleId: "toggle-mineral",
            controlsBlockId: "quantity-controls-mineral",
            addToCartId: "add-to-cart-mineral"
        });
    }

    if (isBottlePage) {
        console.log('Rendering bottles page...');
        // Дані для тари
        const productsData = [
            {
                key: 'plastic-bottle-5l',
                name: "Тара 5 л",
                price: "30.00 грн/шт",
                description: "Пластикова тара для зберігання води об'ємом 5 літрів. Зручна для щоденного використання.",
                image: "tara5.jpg",
                maxQuantity: 10,
                minQuantity: 1
            },
            {
                key: 'plastic-bottle-6l',
                name: "Тара 6 л",
                price: "35.00 грн/шт",
                description: "Пластикова тара для зберігання води об'ємом 6 літрів. Оптимальний варіант для дому та офісу.",
                image: "tara6.jpg",
                maxQuantity: 10,
                minQuantity: 1
            },
            {
                key: 'plastic-bottle-10l',
                name: "Тара 10 л",
                price: "45.00 грн/шт",
                description: "Пластикова тара для зберігання води об'ємом 10 літрів. Ідеальна для сім'ї або офісу.",
                image: "tara10.jpg",
                maxQuantity: 10,
                minQuantity: 1
            },
            {
                key: 'plastic-bottle-19l',
                name: "Тара 19 л",
                price: "60.00 грн/шт",
                description: "Пластикова тара для зберігання води об'ємом 19 літрів. Найекономніший варіант для офісу.",
                image: "tara19.jpg",
                maxQuantity: 10,
                minQuantity: 1
            }
        ];

        // Функція для створення картки товару
        function createProductCard(product) {
            console.log('Creating product card for:', product.name);
            const productCard = document.createElement("div");
            productCard.classList.add("product", "bottle");

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="console.error('Failed to load image:', this.src)" />
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price}</p>
                <p class="product-description">${product.description}</p>

                <button class="add-to-cart" id="add-to-cart-${product.key}">В кошик</button>

                <div class="quantity-controls" id="quantity-controls-${product.key}" style="display: none;">
                    <button id="decrease-${product.key}" class="decrease">−</button>
                    <span id="quantity-${product.key}" class="quantity">0</span>
                    <button id="increase-${product.key}" class="increase">+</button>
                </div>
            `;

            const container = document.getElementById("product-container");
            if (container) {
                container.appendChild(productCard);
                console.log('Card added successfully for:', product.name);
            } else {
                console.error('Product container not found when adding:', product.name);
            }

            // Логіка для кожного товару
            setupBottleCartLogic({
                key: product.key,
                name: product.name,
                price: product.price,
                image: product.image,
                increaseBtnId: `increase-${product.key}`,
                decreaseBtnId: `decrease-${product.key}`,
                quantityElementId: `quantity-${product.key}`,
                controlsBlockId: `quantity-controls-${product.key}`,
                addToCartBtnId: `add-to-cart-${product.key}`
            });
        }

        // Створюємо картки для кожного товару
        productsData.forEach(product => {
            createProductCard(product);
        });
    }

    if (isAccessoriesPage) {
        console.log('Rendering accessories page...');
        const container = document.getElementById("product-container");
        console.log('Found container:', container);

        // Дані для аксесуарів
        const accessoriesData = [
            {
                key: 'water-pump',
                name: "Помпа для води",
                price: "150.00 грн/шт",
                description: "Механічна помпа для зручного наливання води з великих бутлів. Підходить для тари 19л.",
                image: "pompa.jpg",
                maxQuantity: 5,
                minQuantity: 1
            },
            {
                key: 'water-stand',
                name: "Підставка для бутля",
                price: "200.00 грн/шт",
                description: "Стійка підставка для бутлів об'ємом 19л. Зручне розміщення та економія простору.",
                image: "pidstavka.jpg",
                maxQuantity: 5,
                minQuantity: 1
            },
            {
                key: 'water-cup',
                name: "Багаторазовий стакан",
                price: "25.00 грн/шт",
                description: "Екологічний багаторазовий стакан для води. Об'єм 200мл.",
                image: "stakan.jpg",
                maxQuantity: 10,
                minQuantity: 1
            }
        ];

        console.log('Accessories data:', accessoriesData);

        // Створюємо картки для кожного аксесуару
        accessoriesData.forEach((product, index) => {
            console.log(`Creating accessory card ${index + 1}:`, product.name);
            createProductCard(product);
        });
    }
});

function setupCartLogic({ key, name, price, image, increaseBtnId, decreaseBtnId, quantityElementId, cartToggleId, controlsBlockId, addToCartId }) {
    const increaseBtn = document.getElementById(increaseBtnId);
    const decreaseBtn = document.getElementById(decreaseBtnId);
    const quantityElement = document.getElementById(quantityElementId);
    const cartToggle = document.getElementById(cartToggleId);
    const controlsBlock = document.getElementById(controlsBlockId);
    const addToCartBtn = document.getElementById(addToCartId);

    if (!increaseBtn || !decreaseBtn || !quantityElement || !cartToggle || !controlsBlock || !addToCartBtn) {
        return; // Skip if elements don't exist on current page
    }

    let quantity = 4; // Початково — товар не вибрано

    addToCartBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Для того, щоб додати товар в кошик потрібно увійти в акаунт', true);
            return;
        }
        quantity = 5;
        updateUI();
        // Add to cart
        window.cart.addItem({
            key,
            name,
            price,
            image,
            quantity
        });
    });

    increaseBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Для того, щоб додати товар в кошик потрібно увійти в акаунт', true);
            return;
        }
        if (quantity < 100) { // Increased max quantity
            quantity++;
            updateUI();
            // Update cart
            window.cart.updateQuantity(key, quantity);
        }
    });

    decreaseBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Для того, щоб додати товар в кошик потрібно увійти в акаунт', true);
            return;
        }
        if (quantity > 4) {
            quantity--;
            updateUI();
            // Update cart
            window.cart.updateQuantity(key, quantity);
        }
    });

    function updateUI() {
        quantityElement.textContent = quantity;

        if (quantity > 4) {
            cartToggle.checked = true;
            controlsBlock.style.display = "flex";
            addToCartBtn.style.display = "none";
        } else {
            cartToggle.checked = false;
            controlsBlock.style.display = "none";
            addToCartBtn.style.display = "inline-block";
        }
    }
}

function setupBottleCartLogic({ key, name, price, image, increaseBtnId, decreaseBtnId, quantityElementId, controlsBlockId, addToCartBtnId }) {
    const increaseBtn = document.getElementById(increaseBtnId);
    const decreaseBtn = document.getElementById(decreaseBtnId);
    const quantityElement = document.getElementById(quantityElementId);
    const controlsBlock = document.getElementById(controlsBlockId);
    const addToCartBtn = document.getElementById(addToCartBtnId);

    if (!increaseBtn || !decreaseBtn || !quantityElement || !controlsBlock || !addToCartBtn) {
        return;
    }

    let quantity = 0;

    // Перевіряємо чи є товар в кошику
    const cart = window.cart;
    const cartItem = cart.items.find(item => item.key === key);
    if (cartItem) {
        quantity = cartItem.quantity;
        updateUI();
    }

    addToCartBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Для того, щоб додати товар в кошик потрібно увійти в акаунт', true);
            return;
        }

        // Спочатку змінюємо UI
        addToCartBtn.style.display = "none";
        controlsBlock.style.display = "flex";
        quantity = 1;
        quantityElement.textContent = "1";

        // Потім додаємо в кошик
        window.cart.addItem({
            key,
            name,
            price,
            image,
            quantity: 1
        });
    });

    increaseBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Для того, щоб додати товар в кошик потрібно увійти в акаунт', true);
            return;
        }
        if (quantity < 10) {
            quantity++;
            updateUI();
            // Update cart
            window.cart.updateQuantity(key, quantity);
        }
    });

    decreaseBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Для того, щоб додати товар в кошик потрібно увійти в акаунт', true);
            return;
        }
        if (quantity > 0) {
            quantity--;
            updateUI();
            // Update cart
            window.cart.updateQuantity(key, quantity);
        }
    });

    function updateUI() {
        quantityElement.textContent = quantity;

        if (quantity > 0) {
            controlsBlock.style.display = "flex";
            addToCartBtn.style.display = "none";
        } else {
            controlsBlock.style.display = "none";
            addToCartBtn.style.display = "inline-block";
        }
    }
}

// Функція для показу повідомлень користувачу
function showMessage(message, isError = false) {
    // Створюємо або отримуємо контейнер для повідомлень
    let messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        // Стилізація контейнера повідомлень
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
    
    // Стилізація повідомлення
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

    // Додаємо нове повідомлення на початок контейнера
    messageContainer.insertBefore(messageBox, messageContainer.firstChild);

    // Видаляємо повідомлення через 3 секунди
    setTimeout(() => {
        messageBox.style.opacity = '0';
        messageBox.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            messageBox.remove();
            // Якщо більше немає повідомлень, видаляємо контейнер
            if (messageContainer.children.length === 0) {
                messageContainer.remove();
            }
        }, 500);
    }, 3000);
}

// Функція для входу
async function login(email, password) {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Відповідь від сервера при вході:', data);

        if (data.success) {
            // Зберігаємо всі дані користувача
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.user.email || '');
            localStorage.setItem('firstName', data.user.first_name || '');
            localStorage.setItem('lastName', data.user.last_name || '');
            localStorage.setItem('dob', data.user.dob || '');
            
            showMessage('Успішний вхід!');
            
            // Перенаправляємо на головну сторінку через 1 секунду
  setTimeout(() => {
                window.location.href = 'kursova.html';
            }, 1000);
        } else {
            // Показуємо повідомлення про помилку
            showMessage(data.message, true);
        }
    } catch (error) {
        console.error('Помилка входу:', error);
        showMessage('Помилка сервера', true);
    }
}

// Обробник форми входу
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('Будь ласка, заповніть всі поля', true);
        return;
    }
    
    await login(email, password);
});

// Перевірка авторизації при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const loginBtn = document.getElementById('loginBtn');
  const profileBtn = document.getElementById('profileBtn');
  const cartBtn = document.getElementById('cartBtn');
  
  if (token) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'inline-block';
    if (cartBtn) cartBtn.style.display = 'inline-block';
    } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (profileBtn) profileBtn.style.display = 'none';
    if (cartBtn) cartBtn.style.display = 'inline-block'; // Кошик завжди видимий
  }
  
  // Обробка кліку по кнопці профілю
  if (profileBtn) {
    profileBtn.addEventListener("click", (e) => {
      if (!localStorage.getItem('token')) {
        e.preventDefault();
        window.location.href = 'login.html';
      }
    });
  }
  
  // Прибираємо перевірку авторизації для кошика
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      window.location.href = 'cart.html';
    });
  }
});

// Логіка для сторінки профілю
if (document.getElementById('profileForm')) {
    const form = document.getElementById('profileForm');
    const editBtn = document.getElementById('editProfileBtn');
    const formButtons = document.querySelector('.form-buttons');
    const inputs = form.querySelectorAll('input');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    const cancelLogoutBtn = document.getElementById('cancelLogout');

    // Завантаження даних користувача
    const userEmail = localStorage.getItem('userEmail') || '';
    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    const dob = localStorage.getItem('dob') || '';

    // Заповнюємо поля даними
    document.getElementById('email').value = userEmail;
    document.getElementById('firstName').value = firstName;
    document.getElementById('lastName').value = lastName;
    document.getElementById('dob').value = dob;

    // Обробка редагування профілю
    editBtn.addEventListener('click', () => {
        inputs.forEach(input => input.disabled = false);
        formButtons.style.display = 'flex';
        editBtn.style.display = 'none';
    });

    // Обробка скасування редагування
    document.querySelector('.cancel-button').addEventListener('click', () => {
        inputs.forEach(input => input.disabled = true);
        formButtons.style.display = 'none';
        editBtn.style.display = 'block';
        // Відновлюємо початкові значення
        document.getElementById('email').value = userEmail;
        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('dob').value = dob;
    });

    // Обробка збереження змін
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Зберігаємо нові значення
        localStorage.setItem('userEmail', document.getElementById('email').value || '');
        localStorage.setItem('firstName', document.getElementById('firstName').value || '');
        localStorage.setItem('lastName', document.getElementById('lastName').value || '');
        localStorage.setItem('dob', document.getElementById('dob').value || '');

        inputs.forEach(input => input.disabled = true);
        formButtons.style.display = 'none';
        editBtn.style.display = 'block';
        showMessage('Зміни збережено!', 'success');
    });

    // Показати модальне вікно при кліку на кнопку виходу
    logoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'flex';
    });

    // Підтвердження виходу
    confirmLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        localStorage.removeItem('dob');
        window.location.href = 'kursova.html';
    });

    // Скасування виходу
    cancelLogoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });

    // Закриття модального вікна при кліку поза ним
    logoutModal.addEventListener('click', (e) => {
        if (e.target === logoutModal) {
            logoutModal.style.display = 'none';
  }
});
}

// Обробка форми реєстрації
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("registerFirstName").value.trim();
    const lastName = document.getElementById("registerLastName").value.trim();
    const dob = document.getElementById("registerDOB").value;
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

      // Валідація обов'язкових полів
      if (!email || !password) {
        showMessage('Будь ласка, заповніть email та пароль', true);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
          body: JSON.stringify({ 
            firstName: firstName || null, 
            lastName: lastName || null, 
            dob: dob || null, 
            email, 
            password 
          })
    });

        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error('Помилка з\'єднання з сервером');
        }

        if (!response.ok) {
          throw new Error(errorData.message || 'Помилка реєстрації');
        }
        
        if (errorData.success) {
          // Зберігаємо дані користувача
          localStorage.setItem('token', errorData.token);
          localStorage.setItem('userEmail', errorData.user.email);
          localStorage.setItem('firstName', errorData.user.firstName || '');
          localStorage.setItem('lastName', errorData.user.lastName || '');
          localStorage.setItem('dob', errorData.user.dob || '');
          
          showMessage('Реєстрація успішна!');
          
          // Перенаправляємо на головну сторінку через 1 секунду
    setTimeout(() => {
            window.location.href = 'kursova.html';
          }, 1000);
        } else {
          showMessage(errorData.message || 'Помилка реєстрації', true);
        }
      } catch (error) {
        console.error("Помилка реєстрації:", error);
        showMessage(error.message || 'Помилка з\'єднання з сервером', true);
  }
});
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  const loginBtn = document.getElementById("loginBtn");
  const profileBtn = document.getElementById("profileBtn");
  const cartBtn = document.getElementById("cartBtn");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "inline-block";
    if (cartBtn) cartBtn.style.display = "inline-block";

    profileBtn.addEventListener("click", () => {
      window.location.href = "account.html";
    });

    cartBtn.addEventListener("click", () => {
      window.location.href = "cart.html";
    });
  }
});
// Функція для перевірки авторизації
function checkAuth() {
  const token = localStorage.getItem('token');
  const loginBtn = document.getElementById('loginBtn');
  const profileBtn = document.getElementById('profileBtn');
  const cartBtn = document.getElementById('cartBtn');

  if (token) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'inline-block';
    if (cartBtn) cartBtn.style.display = 'inline-block';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (profileBtn) profileBtn.style.display = 'none';
    if (cartBtn) cartBtn.style.display = 'none';
    
    // Якщо користувач не авторизований і знаходиться на сторінці профілю або кошика
    if (window.location.pathname.includes('account.html') || 
        window.location.pathname.includes('cart.html')) {
      window.location.href = 'kursova.html';
    }
  }
}

// Викликаємо перевірку при завантаженні сторінки
document.addEventListener('DOMContentLoaded', checkAuth);

// Update cart UI when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (window.cart) {
    window.cart.updateCartUI();
  }
});

