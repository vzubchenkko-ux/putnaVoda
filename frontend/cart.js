// Функція для показу повідомлень
function showMessage(message, isError = false) {
    // Знаходимо або створюємо елемент повідомлення
    let messageBox = document.getElementById('messageBox');
    
    // Якщо елемент не знайдено, створюємо новий
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'messageBox';
        messageBox.className = 'message cart-message';
        // Вставляємо після контейнера кошика
        const cartContainer = document.querySelector('.cart-container');
        if (cartContainer) {
            cartContainer.after(messageBox);
        } else {
            document.body.appendChild(messageBox);
        }
    }

    // Встановлюємо стилі для повідомлення
    Object.assign(messageBox.style, {
        display: 'block',
        position: 'fixed',
        bottom: '20px', // Змінили з top на bottom
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: isError ? '#ffebee' : '#e8f5e9',
        color: isError ? '#c62828' : '#2e7d32',
        padding: '15px 30px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: '1000',
        maxWidth: '80%',
        textAlign: 'center',
        border: isError ? '1px solid #ef9a9a' : '1px solid #a5d6a7',
        fontSize: '16px',
        fontWeight: '500',
        marginTop: '20px'
    });

    // Встановлюємо текст повідомлення
    messageBox.textContent = message;

    // Показуємо повідомлення
    messageBox.style.display = 'block';

    // Приховуємо повідомлення через 3 секунди
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

class Cart {
    constructor() {
        this.items = this.loadCart();
        this.BOTTLE_SIZES = [5, 6, 10, 19]; // Доступні розміри бутлів
        this.MIN_QUANTITY = 5;
        this.BOTTLE_PRICES = {
            5: 30.00,  // Ціна за тару 5л
            6: 35.00,  // Ціна за тару 6л
            10: 45.00, // Ціна за тару 10л
            19: 60.00  // Ціна за тару 19л
        };
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartUI();
    }

    // Show bottle selection modal
    showBottleSelectionModal(item) {
        const modal = document.createElement('div');
        modal.className = 'modal bottle-selection-modal';
        modal.style.display = 'flex';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const title = document.createElement('h3');
        title.textContent = 'Оберіть бутлі';
        modalContent.appendChild(title);

        const description = document.createElement('p');
        description.textContent = 'Оберіть потрібну тару до води:';
        modalContent.appendChild(description);

        // Створюємо контейнер для вибору бутлів
        const bottleSelectionContainer = document.createElement('div');
        bottleSelectionContainer.className = 'bottle-selection-container';

        // Додаємо вибір для кожного розміру бутля
        this.BOTTLE_SIZES.forEach(size => {
            const bottleOption = document.createElement('div');
            bottleOption.className = 'bottle-option';
            bottleOption.innerHTML = `
                <span class="bottle-size">${size}л (${this.BOTTLE_PRICES[size].toFixed(2)} грн)</span>
                <div class="bottle-controls">
                    <button class="quantity-btn minus" data-size="${size}">-</button>
                    <span class="bottle-quantity" data-size="${size}">0</span>
                    <button class="quantity-btn plus" data-size="${size}">+</button>
                </div>
                <span class="bottle-subtotal" data-size="${size}">0.00 грн</span>
            `;
            bottleSelectionContainer.appendChild(bottleOption);
        });

        modalContent.appendChild(bottleSelectionContainer);

        // Додаємо інформацію про загальний об'єм та вартість
        const totalInfo = document.createElement('div');
        totalInfo.className = 'total-info';
        totalInfo.innerHTML = `
            <div class="total-volume">
                <span>Загальний об'єм: </span>
                <span class="volume-value">0</span>
                <span>л</span>
            </div>
            <div class="total-bottles">
                <span>Вартість тари: </span>
                <span class="bottles-price">0.00</span>
                <span> грн</span>
            </div>
            <div class="total-water">
                <span>Вартість води: </span>
                <span class="water-price">0.00</span>
                <span> грн</span>
            </div>
            <div class="total-price">
                <span>Загальна вартість: </span>
                <span class="price-value">0.00</span>
                <span> грн</span>
            </div>
        `;
        modalContent.appendChild(totalInfo);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'modal-buttons';

        const confirmButton = document.createElement('button');
        confirmButton.className = 'confirm-button';
        confirmButton.textContent = 'Підтвердити';
        confirmButton.disabled = true;

        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'Скасувати';

        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(cancelButton);
        modalContent.appendChild(buttonContainer);

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Об'єкт для зберігання кількості кожного розміру
        const quantities = {};
        this.BOTTLE_SIZES.forEach(size => quantities[size] = 0);

        const basePrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));

        // Функція оновлення загального об'єму та вартості
        const updateTotals = () => {
            const totalVolume = Object.entries(quantities)
                .reduce((sum, [size, count]) => sum + (size * count), 0);
            
            const totalBottlesPrice = Object.entries(quantities)
                .reduce((sum, [size, count]) => sum + (this.BOTTLE_PRICES[size] * count), 0);
            
            const totalWaterPrice = totalVolume * basePrice;
            const totalPrice = totalWaterPrice + totalBottlesPrice;
            
            const volumeElement = modal.querySelector('.volume-value');
            const bottlesPriceElement = modal.querySelector('.bottles-price');
            const waterPriceElement = modal.querySelector('.water-price');
            const priceElement = modal.querySelector('.price-value');
            
            volumeElement.textContent = totalVolume;
            bottlesPriceElement.textContent = totalBottlesPrice.toFixed(2);
            waterPriceElement.textContent = totalWaterPrice.toFixed(2);
            priceElement.textContent = totalPrice.toFixed(2);
            
            // Оновлюємо підсумки для кожного розміру
            Object.entries(quantities).forEach(([size, count]) => {
                const subtotalElement = modal.querySelector(`.bottle-subtotal[data-size="${size}"]`);
                const subtotal = this.BOTTLE_PRICES[size] * count;
                subtotalElement.textContent = `${subtotal.toFixed(2)} грн`;
            });

            confirmButton.disabled = totalVolume < this.MIN_QUANTITY;
        };

        // Додаємо обробники подій для кнопок + та -
        bottleSelectionContainer.addEventListener('click', (e) => {
            if (!e.target.classList.contains('quantity-btn')) return;

            const size = parseInt(e.target.dataset.size);
            const isPlus = e.target.classList.contains('plus');
            
            if (isPlus) {
                quantities[size]++;
            } else if (quantities[size] > 0) {
                quantities[size]--;
            }

            // Оновлюємо відображення кількості
            const quantityElement = modal.querySelector(`.bottle-quantity[data-size="${size}"]`);
            quantityElement.textContent = quantities[size];

            updateTotals();
        });

        confirmButton.addEventListener('click', () => {
            // Додаємо воду як один товар
            const waterItem = {
                ...item,
                key: `${item.key}_water_${Date.now()}`,
                quantity: Object.entries(quantities)
                    .reduce((sum, [size, count]) => sum + (size * count), 0),
                price: item.price,
                isWater: true
            };
            this.items.push(waterItem);

            // Додаємо кожен розмір тари як окремий товар
            Object.entries(quantities).forEach(([size, count]) => {
                if (count > 0) {
                    const bottleItem = {
                        name: `Тара ${size}л`,
                        key: `bottle_${size}_${Date.now()}`,
                        image: 'bottle.png', // Переконайтесь що у вас є це зображення
                        quantity: count,
                        price: this.BOTTLE_PRICES[size].toFixed(2),
                        size: parseInt(size),
                        isBottle: true
                    };
                    this.items.push(bottleItem);
                }
            });
            
            this.saveCart();
            modal.remove();
            showMessage(`${item.name} та тару додано до кошика!`);
        });

        cancelButton.addEventListener('click', () => {
            modal.remove();
        });
    }

    // Add item to cart
    addItem(item) {
        // Якщо це тара, додаємо її напряму
        const existingItem = this.items.find(i => i.key === item.key);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            // Додаємо властивості для тари
            if (item.key.startsWith('plastic-bottle-')) {
                const size = parseInt(item.key.split('-')[2]);
                item.isBottle = true;
                item.size = size;
            }
            this.items.push(item);
        }
        this.saveCart();
        showMessage(`${item.name} додано до кошика!`);
    }

    // Remove item from cart
    removeItem(key) {
        console.log('Removing item:', key);
        this.items = this.items.filter(item => item.key !== key);
        this.saveCart();
        
        // Оновлюємо загальну суму після видалення
        const totalElement = document.getElementById('totalAmount');
        if (totalElement) {
            const newTotal = this.calculateTotal();
            console.log('New total after removal:', newTotal);
            totalElement.textContent = newTotal.toFixed(2) + ' грн';
        }
        
        showMessage('Товар видалено з кошика');
    }

    // Update item quantity
    updateQuantity(key, quantity, isCartPage = false) {
        const item = this.items.find(i => i.key === key);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(key);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }

    }

    // Calculate total price
    calculateTotal() {
        console.log('Calculating total for items:', this.items);
        return this.items.reduce((total, item) => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            const itemTotal = price * quantity;
            console.log(`Item ${item.name}: price=${price}, quantity=${quantity}, total=${itemTotal}`);
            return total + itemTotal;
        }, 0);
    }

    // Group items by type
    groupItemsByType() {
        const groupedItems = {
            water: {},
            bottles: {}
        };
        
        this.items.forEach(item => {
            if (item.isWater) {
                const baseKey = item.key.split('_')[0];
                if (!groupedItems.water[baseKey]) {
                    groupedItems.water[baseKey] = {
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        totalQuantity: 0,
                        totalPrice: 0
                    };
                }
                groupedItems.water[baseKey].totalQuantity += item.quantity;
                groupedItems.water[baseKey].totalPrice += parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity;
            } else if (item.isBottle) {
                const size = item.size;
                if (!groupedItems.bottles[size]) {
                    groupedItems.bottles[size] = {
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: 0,
                        totalPrice: 0
                    };
                }
                groupedItems.bottles[size].quantity += item.quantity;
                groupedItems.bottles[size].totalPrice += parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity;
            }
        });
        
        return groupedItems;
    }

    // Update cart UI with grouped items
    updateCartUI() {
        const cartItemsList = document.getElementById('cartItemsList');
        const cartEmpty = document.querySelector('.cart-empty');
        const checkoutButton = document.querySelector('.checkout-btn');
        
        if (!cartItemsList) return;

        // Очищаємо список товарів
        while (cartItemsList.firstChild) {
            cartItemsList.removeChild(cartItemsList.firstChild);
        }

        if (this.items.length === 0) {
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (checkoutButton) checkoutButton.style.display = 'none';
            
            // Якщо кошик порожній, встановлюємо загальну суму в 0
            const totalElement = document.getElementById('totalAmount');
            if (totalElement) {
                totalElement.textContent = '0.00 грн';
            }
            return;
        }

        if (cartEmpty) cartEmpty.style.display = 'none';
        if (checkoutButton) checkoutButton.style.display = 'block';

        // Групуємо товари за типом води
        const waterGroups = {};
        this.items.forEach(item => {
            if (!waterGroups[item.name]) {
                waterGroups[item.name] = {
                    name: item.name,
                    image: item.image,
                    key: item.key,
                    volumes: {}
                };
            }
            
            // Групуємо за об'ємами
            const volume = item.size || item.volume;
            if (!waterGroups[item.name].volumes[volume]) {
                waterGroups[item.name].volumes[volume] = {
                    quantity: 0,
                    price: parseFloat(item.price)
                };
            }
            waterGroups[item.name].volumes[volume].quantity += item.quantity;
        });

        // Створюємо елементи для кожної групи води
        Object.entries(waterGroups).forEach(([name, group]) => {
            const waterGroup = document.createElement('div');
            waterGroup.className = 'cart-item';
            
            let volumesHtml = '';
            let totalQuantity = 0;
            let totalPrice = 0;

            Object.entries(group.volumes).forEach(([volume, data]) => {
                const volumeNumber = parseInt(volume);
                if (name.toLowerCase().includes('вода')) {
                    totalQuantity += data.quantity * volumeNumber;
                } else {
                    totalQuantity += data.quantity;
                }
                totalPrice += data.quantity * data.price;
                volumesHtml += `
                    <div class="volume-info">
                        <span>${volume}л x ${data.quantity} шт.</span>
                    </div>
                `;
            });

            waterGroup.innerHTML = `
                <div class="item-image">
                    <img src="${group.image}" alt="${name}">
                </div>
                <div class="item-details">
                    <h3>${name}</h3>
                    <div class="volumes-list">
                        ${volumesHtml}
                    </div>
                    <div class="total-info">
                        <span>Загальна кількість: ${totalQuantity}${name.toLowerCase().includes('вода') ? 'л' : ' шт.'}</span>
                        <span class="total-price">Сума: ${totalPrice.toFixed(2)} грн</span>
                    </div>
                </div>
                <button class="remove-btn" data-key="${group.key}">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            // Додаємо обробник для кнопки видалення
            const removeBtn = waterGroup.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    const itemKey = e.currentTarget.getAttribute('data-key');
                    console.log('Remove button clicked, key:', itemKey);
                    if (itemKey) {
                        this.removeItem(itemKey);
                    }
                });
            }
            
            cartItemsList.appendChild(waterGroup);
        });

        // Оновлюємо загальну суму
        const totalElement = document.getElementById('totalAmount');
        if (totalElement) {
            const total = this.calculateTotal();
            console.log('Total sum updated:', total);
            totalElement.textContent = total.toFixed(2) + ' грн';
        }
    }

    // Create water item element
    createWaterItemElement(key, item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        itemDiv.innerHTML = `
            <div class="item-image">
                <img src="images/${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-price">${item.price}</p>
                <div class="total-volume">Загальний об'єм: ${item.totalQuantity}л</div>
            </div>
            <div class="item-total">
                <p>${item.totalPrice.toFixed(2)} грн</p>
            </div>
            <button class="remove-item" data-key="${key}" data-type="water">
                <i class="fas fa-trash"></i>
            </button>
        `;

        const removeBtn = itemDiv.querySelector('.remove-item');
        removeBtn.addEventListener('click', () => {
            this.items = this.items.filter(i => !i.key.startsWith(key) || !i.isWater);
            this.saveCart();
        });

        return itemDiv;
    }

    // Create bottle item element
    createBottleItemElement(size, item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item bottle-item';
        
        itemDiv.innerHTML = `
            <div class="item-image">
                <img src="images/${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-price">${item.price}</p>
                <div class="bottle-quantity">Кількість: ${item.quantity} шт.</div>
            </div>
            <div class="item-total">
                <p>${item.totalPrice.toFixed(2)} грн</p>
            </div>
            <button class="remove-item" data-size="${size}" data-type="bottle">
                <i class="fas fa-trash"></i>
            </button>
        `;

        const removeBtn = itemDiv.querySelector('.remove-item');
        removeBtn.addEventListener('click', () => {
            this.items = this.items.filter(i => !(i.isBottle && i.size === parseInt(size)));
            this.saveCart();
        });

        return itemDiv;
    }

    // Update cart summary
    updateSummary(subtotal) {
        const summaryDetails = document.querySelector('.summary-details');
        const totalAmount = document.getElementById('totalAmount');
        
        if (totalAmount) {
            totalAmount.textContent = `${subtotal.toFixed(2)} грн`;
        }

        if (!summaryDetails) return;

        summaryDetails.innerHTML = `
            <div class="summary-row">
                <span>Сума замовлення:</span>
                <span>${subtotal.toFixed(2)} грн</span>
            </div>
            <div class="summary-total">
                <span>До сплати:</span>
                <span>${subtotal.toFixed(2)} грн</span>
            </div>
            <button class="clear-cart-button">
                <i class="fas fa-trash"></i>
                Очистити кошик
            </button>
        `;

        // Додаємо обробник події для кнопки очищення
        const clearButton = summaryDetails.querySelector('.clear-cart-button');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearCart());
        }
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
        showMessage('Кошик очищено');
    }
}

// Initialize cart
const cart = new Cart();

// Export cart instance
window.cart = cart;

// Глобальні змінні для зберігання стану
let selectedPaymentOption = null;

// Глобальні змінні для вибору дати та часу
let selectedDate = null;
let selectedTimeSlot = null;
const WORK_HOURS = {
    start: 10, // 10:00
    end: 18.5  // 18:30
};
const TIME_SLOT_INTERVAL = 30; // 30 хвилин
const MAX_VISIBLE_SLOTS = 6;

// Форматування дати
function formatDate(date) {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('uk-UA', options);
}

// Форматування часу
function formatTime(hours) {
    const wholeHours = Math.floor(hours);
    const minutes = (hours % 1) * 60;
    return `${wholeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Генерація часових слотів
function generateTimeSlots(selectedDay) {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const isToday = selectedDay === 'today';
    
    // Початковий та кінцевий час роботи
    const START_TIME = 10; // 10:00
    const END_TIME = 18.5; // 18:30
    const INTERVAL = 30; // 30 хвилин

    // Перебираємо всі можливі часові слоти
    for (let hour = START_TIME; hour <= END_TIME; hour += 0.5) {
        const slotHour = Math.floor(hour);
        const slotMinutes = (hour % 1) * 60;
        
        // Якщо сьогодні, перевіряємо чи слот ще доступний
        if (isToday) {
            // Перевіряємо чи до цього часу залишилось більше 30 хвилин
            const timeUntilSlot = (slotHour - currentHour) * 60 + (slotMinutes - currentMinutes);
            if (timeUntilSlot <= 30) continue;
        }

        slots.push({
            time: `${String(slotHour).padStart(2, '0')}:${String(slotMinutes).padStart(2, '0')}`,
            value: hour
        });
    }

    return slots;
}

// Оновлення відображення часових слотів
function updateTimeSlots() {
    if (!selectedDate) return;

    const slots = generateTimeSlots(selectedDate);
    const visibleSlotsContainer = document.getElementById('visibleTimeSlots');
    const hiddenSlotsContainer = document.getElementById('hiddenTimeSlots');
    
    if (!visibleSlotsContainer || !hiddenSlotsContainer) return;

    visibleSlotsContainer.innerHTML = '';
    hiddenSlotsContainer.innerHTML = '';
    
    // Додаємо клас для правильного відображення сітки
    visibleSlotsContainer.className = 'time-slots-grid';
    hiddenSlotsContainer.className = 'time-slots-grid hidden-slots';

    if (slots.length === 0) {
        const noSlotsMessage = document.createElement('div');
        noSlotsMessage.className = 'no-slots-message';
        noSlotsMessage.textContent = 'На цей день, нажаль, немає вільних слотів, але можливо вам підійде слот на інший день?';
        visibleSlotsContainer.appendChild(noSlotsMessage);
        return;
    }

    // Показуємо перші 6 слотів (або менше, якщо їх менше 6)
    const visibleSlots = slots.slice(0, Math.min(6, slots.length));
    const hiddenSlots = slots.slice(6);

    // Додаємо видимі слоти (перші 6)
    visibleSlots.forEach(slot => {
        const button = document.createElement('button');
        button.className = 'time-slot';
        button.textContent = slot.time;
        if (selectedTimeSlot && selectedTimeSlot.time === slot.time) {
            button.classList.add('selected');
        }
        button.onclick = () => selectTimeSlot(slot);
        visibleSlotsContainer.appendChild(button);
    });

    // Якщо є приховані слоти, додаємо кнопку "Показати більше часу"
    if (hiddenSlots.length > 0) {
        const showMoreButton = document.createElement('button');
        showMoreButton.className = 'time-slot show-more';
        showMoreButton.textContent = 'Показати більше часу';
        showMoreButton.onclick = () => {
            hiddenSlotsContainer.style.display = 
                hiddenSlotsContainer.style.display === 'grid' ? 'none' : 'grid';
            showMoreButton.textContent = 
                hiddenSlotsContainer.style.display === 'grid' ? 'Приховати' : 'Показати більше часу';
        };
        visibleSlotsContainer.appendChild(showMoreButton);

        // Додаємо приховані слоти
        hiddenSlots.forEach(slot => {
            const button = document.createElement('button');
            button.className = 'time-slot';
            button.textContent = slot.time;
            if (selectedTimeSlot && selectedTimeSlot.time === slot.time) {
                button.classList.add('selected');
            }
            button.onclick = () => selectTimeSlot(slot);
            hiddenSlotsContainer.appendChild(button);
        });
    }
    
    // Оновлюємо стан кнопки підтвердження
    updateConfirmButton();
}

// Оновлюємо слоти кожні 30 секунд для актуальності
setInterval(() => {
    if (selectedDate === 'today') {
        updateTimeSlots();
    }
}, 30000);

// Вибір дати
function selectDate(day) {
    selectedDate = day;
    selectedTimeSlot = null; // Скидаємо вибраний час при зміні дати
    
    // Оновлюємо вигляд кнопок дат
    document.querySelectorAll('.date-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById(`${day}Btn`).classList.add('selected');

    // Оновлюємо часові слоти
    updateTimeSlots();
    updateSelectedDateTime();
    updateConfirmButton();
}

// Вибір часового слоту
function selectTimeSlot(slot) {
    selectedTimeSlot = slot;
    
    // Оновлюємо вигляд кнопок часу
    document.querySelectorAll('.time-slot').forEach(btn => {
        if (btn.textContent === slot.time) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    updateSelectedDateTime();
    updateConfirmButton();
}

// Оновлення відображення вибраної дати та часу
function updateSelectedDateTime() {
    const selectedDateTimeElement = document.getElementById('selectedDateTime');
    if (!selectedDateTimeElement) return;
    
    if (selectedDate && selectedTimeSlot) {
        const date = new Date();
        if (selectedDate === 'tomorrow') {
            date.setDate(date.getDate() + 1);
        }
        const dateStr = formatDate(date);
        selectedDateTimeElement.textContent = `${dateStr}, ${selectedTimeSlot.time}`;
    } else {
        selectedDateTimeElement.textContent = 'Не вибрано';
    }
}

// Оновлення стану кнопки підтвердження
function updateConfirmButton() {
    const confirmButton = document.querySelector('.confirm-order-btn');
    if (!confirmButton) return;
    
    const isValid = selectedDate && selectedTimeSlot && selectedPaymentOption;
    console.log('Button state update:', { 
        selectedDate, 
        selectedTimeSlot: selectedTimeSlot ? selectedTimeSlot.time : null, 
        selectedPaymentOption, 
        isValid 
    });
    confirmButton.disabled = !isValid;
}

// Показ модального вікна оформлення самовивозу
function showPickupModal() {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Для оформлення замовлення потрібно увійти в акаунт', true);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    const modal = document.getElementById('pickupModal');
    if (!modal) {
        console.error('Модальне вікно не знайдено');
        return;
    }

    modal.style.display = 'block';

    // Оновлюємо дати на кнопках
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayDetails = document.querySelector('#todayBtn .date-details');
    const tomorrowDetails = document.querySelector('#tomorrowBtn .date-details');
    
    if (todayDetails) todayDetails.textContent = formatDate(today);
    if (tomorrowDetails) tomorrowDetails.textContent = formatDate(tomorrow);

    // Скидаємо вибрані значення
    selectedDate = null;
    selectedTimeSlot = null;
    selectedPaymentOption = null;

    // Скидаємо вибрані опції
    document.querySelectorAll('.date-option').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));

    // Оновлюємо інтерфейс
    updateSelectedDateTime();
    updateConfirmButton();
}

// Закриття модального вікна
function closePickupModal() {
    const modal = document.getElementById('pickupModal');
    modal.style.display = 'none';
    // Скидаємо вибрані опції
    selectedPaymentOption = null;
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
}

// Налаштування поля вводу дати і часу
function setupDateTimeInput() {
    const dateTimeInput = document.getElementById('pickupDateTime');
    if (!dateTimeInput) return;

    // Отримуємо поточну дату та час
    const now = new Date();
    
    // Додаємо 1 годину до поточного часу для мінімального часу замовлення
    const minDateTime = new Date(now.getTime() + (60 * 60 * 1000));
    
    // Форматуємо дату і час для input
    const minDateTimeStr = minDateTime.toISOString().slice(0, 16);
    
    // Встановлюємо мінімальну дату і час
    dateTimeInput.min = minDateTimeStr;
    
    // Якщо поле пусте, встановлюємо значення за замовчуванням
    if (!dateTimeInput.value) {
        dateTimeInput.value = minDateTimeStr;
    }
}

// Вибір способу оплати
function selectPaymentOption(option) {
    selectedPaymentOption = option;
    
    // Оновлюємо візуальне відображення
    document.querySelectorAll('.payment-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    document.getElementById(`${option}Payment`).classList.add('selected');
    
    updateConfirmButton();
}

// Функція для показу модального вікна оплати
function showPaymentModal() {
    // Створюємо модальне вікно, якщо воно ще не існує
    let paymentModal = document.getElementById('paymentModal');
    if (!paymentModal) {
        paymentModal = document.createElement('div');
        paymentModal.id = 'paymentModal';
        paymentModal.className = 'payment-modal';
        
        const total = cart.calculateTotal();
        const paymentAmount = selectedPaymentOption === 'half' ? total / 2 : total;
        
        paymentModal.innerHTML = `
            <div class="payment-modal-content">
                <button class="close-payment-modal">&times;</button>
                <div class="payment-modal-header">
                    <h2>Оплата замовлення</h2>
                    <div class="payment-amount">${paymentAmount.toFixed(2)} грн</div>
                </div>
                <div class="payment-methods">
                    <button class="payment-method-btn" id="cardPayBtn">
                        <i class="far fa-credit-card"></i>
                        Картою на сайті
                    </button>
                    <button class="payment-method-btn" id="googlePayBtn" disabled>
                        <i class="fab fa-google"></i>
                        Google Pay (незабаром)
                    </button>
                    <button class="payment-method-btn" id="applePayBtn" disabled>
                        <i class="fab fa-apple"></i>
                        Apple Pay (незабаром)
                    </button>
                </div>
                <form class="card-payment-form" id="cardPaymentForm" style="display: none;">
                    <div class="form-row card-number">
                        <label for="cardNumber">Номер карти</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
                    </div>
                    <div class="expiry-cvv-row">
                        <div class="form-row">
                            <label for="expiryDate">Термін дії</label>
                            <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5" required>
                        </div>
                        <div class="form-row">
                            <label for="cvv">CVV</label>
                            <input type="password" id="cvv" placeholder="123" maxlength="3" required>
                        </div>
                    </div>
                    <button type="submit" class="pay-button">Оплатити ${paymentAmount.toFixed(2)} грн</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(paymentModal);
        
        // Додаємо обробники подій
        const closeBtn = paymentModal.querySelector('.close-payment-modal');
        const cardPayBtn = document.getElementById('cardPayBtn');
        const cardPaymentForm = document.getElementById('cardPaymentForm');
        const cardNumberInput = document.getElementById('cardNumber');
        const expiryDateInput = document.getElementById('expiryDate');
        
        // Закриття модального вікна
        closeBtn.onclick = () => {
            paymentModal.style.display = 'none';
        };
        
        // Показ форми оплати картою
        cardPayBtn.onclick = () => {
            cardPaymentForm.style.display = 'block';
            document.querySelectorAll('.payment-method-btn').forEach(btn => {
                btn.style.display = 'none';
            });
        };
        
        // Форматування номера карти (додавання пробілів)
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        });
        
        // Форматування дати (додавання /)
        expiryDateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });
        
        // Обробка відправки форми
        cardPaymentForm.onsubmit = async (e) => {
            e.preventDefault();
            
            // Імітуємо обробку оплати
            const submitButton = cardPaymentForm.querySelector('.pay-button');
            submitButton.disabled = true;
            submitButton.textContent = 'Обробка оплати...';
            
            try {
                // Імітуємо затримку обробки
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Отримуємо час отримання
                const pickupTime = selectedTimeSlot.time.split(':');
                const pickupDate = new Date();
                
                if (selectedDate === 'tomorrow') {
                    pickupDate.setDate(pickupDate.getDate() + 1);
                }
                
                pickupDate.setHours(parseInt(pickupTime[0]), parseInt(pickupTime[1]), 0, 0);

                // Розраховуємо суми
                const totalAmount = cart.calculateTotal();
                const paymentAmount = selectedPaymentOption === 'half' ? totalAmount / 2 : totalAmount;
                
                // Створюємо об'єкт замовлення
                const orderData = {
                    orderId: `ORD-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    items: cart.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: parseFloat(item.price),
                        size: item.size || item.volume,
                        total: item.quantity * parseFloat(item.price)
                    })),
                    pickupDateTime: pickupDate.toISOString(),
                    paymentType: selectedPaymentOption,
                    paymentAmount: paymentAmount,
                    totalAmount: totalAmount,
                    remainingAmount: selectedPaymentOption === 'half' ? paymentAmount : 0
                };

                console.log('Saving order data:', orderData);

                // Перевіряємо чи всі необхідні дані присутні
                if (!orderData.orderId || !orderData.items || orderData.items.length === 0 || 
                    !orderData.pickupDateTime || !orderData.paymentType || 
                    !orderData.paymentAmount || !orderData.totalAmount) {
                    throw new Error('Incomplete order data');
                }

                // Зберігаємо дані замовлення
                localStorage.setItem('lastOrder', JSON.stringify(orderData));
                
                // Перевіряємо чи дані збереглися
                const savedOrder = localStorage.getItem('lastOrder');
                if (!savedOrder) {
                    throw new Error('Failed to save order data');
                }
                
                // Очищаємо кошик тільки після успішного збереження замовлення
                cart.items = [];
                cart.saveCart();
                
                // Закриваємо модальне вікно
                paymentModal.style.display = 'none';
                
                // Перенаправляємо на сторінку підтвердження замовлення
                window.location.href = 'order-confirmation.html';
                
            } catch (error) {
                console.error('Order processing error:', error);
                showMessage('Помилка оформлення замовлення. Спробуйте ще раз', true);
                submitButton.disabled = false;
                submitButton.textContent = `Оплатити ${paymentAmount.toFixed(2)} грн`;
            }
        };
    }
    
    paymentModal.style.display = 'block';
}

// Оновлюємо функцію підтвердження замовлення
function confirmOrder() {
    if (!selectedDate || !selectedTimeSlot || !selectedPaymentOption) {
        showError('Будь ласка, заповніть всі поля');
        return;
    }

    // Показуємо модальне вікно оплати
    showPaymentModal();
}

// Показ повідомлення про помилку
function showError(message) {
    const errorElement = document.getElementById('dateTimeError');
    errorElement.textContent = message;
    setTimeout(() => {
        errorElement.textContent = '';
    }, 3000);
}

// Закриття модального вікна при кліку поза ним
window.onclick = function(event) {
    const modal = document.getElementById('pickupModal');
    if (event.target === modal) {
        closePickupModal();
    }
};

// Функція для оновлення відображення кошика
function updateCartDisplay() {
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const items = cart.getItems();

    // Очищаємо весь список товарів
    cartItemsList.innerHTML = '';

    if (items.length === 0) {
        // Показуємо повідомлення про порожній кошик
        cartItemsList.appendChild(emptyCartMessage);
        emptyCartMessage.style.display = 'block';
    } else {
        // Приховуємо повідомлення про порожній кошик
        emptyCartMessage.style.display = 'none';
        
        // Додаємо товари до списку
        items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${item.price} грн</span>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cart.decrementQuantity('${item.id}')">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.incrementQuantity('${item.id}')">+</button>
                </div>
                <button class="remove-item" onclick="cart.removeItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsList.appendChild(cartItem);
        });
    }

    // Оновлюємо загальну суму
    const totalAmount = document.getElementById('totalAmount');
    if (totalAmount) {
        totalAmount.textContent = cart.getTotal().toFixed(2) + ' грн';
    }

    // Активуємо/деактивуємо кнопку оформлення замовлення
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        const totalLiters = cart.getTotalLiters();
        checkoutBtn.disabled = totalLiters < 5;
    }
} 
