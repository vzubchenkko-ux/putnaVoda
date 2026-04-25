-- Видалення існуючих таблиць
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS shopping_cart CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admin_activity CASCADE;

-- Створення таблиці користувачів
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    dob DATE,
    role VARCHAR(10) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Створення таблиці замовлень
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    pickup_datetime TIMESTAMP NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Створення таблиці товарів замовлення
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_type VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    size VARCHAR(20)
);

-- Створення таблиці кошика
CREATE TABLE IF NOT EXISTS shopping_cart (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(100) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    size VARCHAR(20),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця для логування активності адміністратора
CREATE TABLE IF NOT EXISTS admin_activity (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця для товарів
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Тригер для оновлення updated_at у таблиці products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Функція для логування активності адміністратора
CREATE OR REPLACE FUNCTION log_admin_activity(
    admin_id INTEGER,
    action_type VARCHAR(50),
    description TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_activity (admin_id, action_type, description)
    VALUES (admin_id, action_type, description);
END;
$$ LANGUAGE plpgsql;

-- Створення адміністратора
INSERT INTO users (email, password, role, first_name, last_name)
VALUES ('admin@pytna.ua', 'pytna123', 'admin', 'Admin', 'User')
ON CONFLICT (email) 
DO UPDATE SET role = 'admin', password = 'pytna123';

-- Додавання тестових даних для products
INSERT INTO products (name, description, price, category, stock_quantity, image_url)
VALUES 
    ('Вода "Карпатська джерельна"', 'Природна питна вода з Карпатських гір', 25.00, 'water', 100, '/images/water1.jpg'),
    ('Вода "Гірська кришталева"', 'Чиста питна вода з гірських джерел', 20.00, 'water', 150, '/images/water2.jpg'),
    ('Помпа механічна', 'Механічна помпа для бутлів', 150.00, 'accessories', 50, '/images/pump1.jpg'),
    ('Підставка для бутля', 'Міцна підставка для 19л бутлів', 200.00, 'accessories', 30, '/images/stand1.jpg')
ON CONFLICT DO NOTHING; 