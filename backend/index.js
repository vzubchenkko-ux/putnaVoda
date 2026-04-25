const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key'; // в реальному проекті використовуй process.env

// Налаштування CORS
app.use(cors());
app.use(express.json());

// API маршрути
// Отримання списку користувачів
app.get('/users', async (req, res) => {
  console.log('Отримано запит до /users');
  try {
    console.log('Спроба виконати запит до бази даних...');
    const result = await db.query('SELECT id, email, first_name, last_name, dob FROM users');
    console.log('Результат запиту:', result.rows);
    res.json({
      success: true,
      users: result.rows
    });
  } catch (err) {
    console.error('Детальна помилка отримання користувачів:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка сервера: ' + err.message 
    });
  }
});

// Вхід
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Спроба входу:', { email, password });

  try {
    // Спочатку перевіряємо, чи існує користувач з таким email
    const userExists = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length === 0) {
      console.log('Користувача не знайдено:', email);
      return res.status(404).json({ 
        success: false, 
        message: 'Схоже такого користувача не знайдено :( Але завжди можна зареєструватись',
        notFound: true
      });
    }

    // Якщо користувач існує, перевіряємо пароль
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = jwt.sign({ email: user.email }, SECRET_KEY);
      console.log('Успішний вхід для:', email);
      res.json({ 
        success: true, 
        token,
        user: {
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } else {
      console.log('Невірний пароль для:', email);
      res.status(401).json({ 
        success: false, 
        message: 'Невірний пароль' 
      });
    }
  } catch (error) {
    console.error('Помилка входу:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка сервера' 
    });
  }
});

// Перевірка токена
app.get('/api/verify-token', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

// Реєстрація нового користувача
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, dob, email, password } = req.body;
  
  // Перевірка обов'язкових полів
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email та пароль обов\'язкові'
    });
  }

  try {
    // Перевіряємо, чи існує користувач з таким email
    const userExists = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Користувач з таким email вже існує'
      });
    }

    // Створюємо нового користувача
    try {
      const result = await db.query(
        'INSERT INTO users (first_name, last_name, dob, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [firstName || null, lastName || null, dob || null, email, password]
      );

      const user = result.rows[0];
      const token = jwt.sign({ email: user.email }, SECRET_KEY);

      res.status(201).json({
        success: true,
        message: 'Реєстрація успішна!',
        token,
        user: {
          email: user.email,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          dob: user.dob || ''
        }
      });
    } catch (dbError) {
      console.error('Помилка при створенні користувача:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Помилка при створенні користувача. Будь ласка, перевірте правильність введених даних.'
      });
    }
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера при реєстрації. Спробуйте пізніше.'
    });
  }
});

// Оновлення даних користувача
app.put('/api/users/profile', async (req, res) => {
  const { email, firstName, lastName, dob } = req.body;
  const authHeader = req.headers.authorization;
  
  console.log('Отримано запит на оновлення профілю:', { email, firstName, lastName, dob });
  console.log('Authorization header:', authHeader);

  if (!authHeader) {
    console.log('Відсутній токен авторизації');
    return res.status(401).json({ 
      success: false, 
      message: 'Необхідна авторизація' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Перевіряємо токен і отримуємо email користувача
    const decoded = jwt.verify(token, SECRET_KEY);
    const currentEmail = decoded.email;
    console.log('Декодований email з токена:', currentEmail);

    // Оновлюємо дані користувача
    console.log('Виконуємо запит до БД з параметрами:', {
      firstName: firstName || null,
      lastName: lastName || null,
      dob: dob || null,
      newEmail: email,
      currentEmail
    });

    const result = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, dob = $3, email = $4 WHERE email = $5 RETURNING *',
      [firstName || null, lastName || null, dob || null, email, currentEmail]
    );

    console.log('Результат оновлення:', result.rows[0]);

    if (result.rows.length === 0) {
      console.log('Користувача не знайдено в БД');
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    const updatedUser = result.rows[0];
    // Якщо email змінився, створюємо новий токен
    const newToken = email !== currentEmail ? 
      jwt.sign({ email: email }, SECRET_KEY) : 
      token;

    console.log('Відправляємо оновлені дані:', {
      success: true,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      dob: updatedUser.dob
    });

    res.json({
      success: true,
      message: 'Профіль оновлено успішно!',
      token: newToken,
      user: {
        email: updatedUser.email,
        firstName: updatedUser.first_name || '',
        lastName: updatedUser.last_name || '',
        dob: updatedUser.dob || ''
      }
    });

  } catch (error) {
    console.error('Помилка оновлення профілю:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера при оновленні профілю'
    });
  }
});

// Отримання даних поточного користувача
app.get('/api/users/current', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Необхідна авторизація' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        dob: user.dob || ''
      }
    });

  } catch (error) {
    console.error('Помилка отримання даних користувача:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера при отриманні даних користувача'
    });
  }
});

// Middleware для перевірки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Необхідна авторизація' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Необхідна авторизація' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Недійсний токен' });
  }
};

// Створення нового замовлення
app.post('/api/orders', authenticateToken, async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        const { items, pickup_datetime, payment_type, total_amount, payment_amount } = req.body;
        const userResult = await client.query('SELECT id FROM users WHERE email = $1', [req.user.email]);
        const userId = userResult.rows[0].id;
        
        // Створюємо замовлення
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, pickup_datetime, payment_type, total_amount, payment_amount)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [userId, pickup_datetime, payment_type, total_amount, payment_amount]
        );
        
        const orderId = orderResult.rows[0].id;
        
        // Додаємо товари замовлення
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_type, product_name, quantity, price, size)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [orderId, item.type, item.name, item.quantity, item.price, item.size]
            );
        }
        
        await client.query('COMMIT');
        
        // Очищаємо кошик користувача
        await client.query('DELETE FROM shopping_cart WHERE user_email = $1', [req.user.email]);
        
        res.json({
            success: true,
            orderId,
            message: 'Замовлення успішно створено'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Помилка створення замовлення:', error);
        res.status(500).json({
            success: false,
            message: 'Помилка створення замовлення'
        });
    } finally {
        client.release();
    }
});

// Отримання історії замовлень користувача
app.get('/api/orders/history', authenticateToken, async (req, res) => {
    try {
        const userResult = await db.query('SELECT id FROM users WHERE email = $1', [req.user.email]);
        const userId = userResult.rows[0].id;
        
        const result = await db.query(
            `SELECT o.id, o.order_date, o.pickup_datetime, o.payment_type,
                    o.payment_status, o.total_amount, o.payment_amount, o.status,
                    json_agg(json_build_object(
                        'type', oi.product_type,
                        'name', oi.product_name,
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'size', oi.size
                    )) as items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = $1
             GROUP BY o.id
             ORDER BY o.order_date DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            orders: result.rows
        });
    } catch (error) {
        console.error('Помилка отримання історії замовлень:', error);
        res.status(500).json({
            success: false,
            message: 'Помилка отримання історії замовлень'
        });
    }
});

// Статичні файли
app.use(express.static(path.join(__dirname, '../frontend')));

// Маршрути для HTML сторінок
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/kursova.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/cart.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/account.html'));
});

app.get('/order-confirmation', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/order-confirmation.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
