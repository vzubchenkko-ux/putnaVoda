const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // ім'я користувача в pgAdmin
  host: 'localhost',
  database: 'kursova',     // назва твоєї бази даних
  password: '260306',      // пароль до неї
  port: 5432,             // порт за замовчуванням
});

// Перевірка підключення
pool.connect((err, client, release) => {
  if (err) {
    console.error('Помилка підключення до бази даних:', err.stack);
    console.error('Деталі підключення:', {
      user: pool.options.user,
      host: pool.options.host,
      database: pool.options.database,
      port: pool.options.port
    });
  } else {
    console.log('Успішне підключення до бази даних');
    // Перевіряємо наявність таблиці users
    client.query('SELECT to_regclass(\'public.users\')', (err, result) => {
      if (err) {
        console.error('Помилка перевірки таблиці:', err);
      } else {
        console.log('Перевірка таблиці users:', result.rows[0].to_regclass);
      }
      release();
    });
  }
});

// Додаємо обробку помилок для пула підключень
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => {
    console.log('Executing query:', { text, params });
    return pool.query(text, params).catch(err => {
      console.error('Query error:', err);
      throw err;
    });
  },
};
