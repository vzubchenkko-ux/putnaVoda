const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Оновлення ролі користувача
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;
        
        // Перевірка чи є користувач адміністратором
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Необхідна авторизація' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminCheck = await db.query(
            'SELECT role FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (adminCheck.rows[0].role !== 'admin') {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }

        // Оновлення ролі
        await db.query(
            'UPDATE users SET role = $1 WHERE id = $2',
            [role, userId]
        );

        res.json({ message: 'Роль користувача успішно оновлено' });
    } catch (error) {
        console.error('Помилка при оновленні ролі:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// Реєстрація користувача
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Перевірка чи існує користувач
        const userExists = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Користувач вже існує' });
        }

        // Визначення ролі (admin для admin@pytna.ua, user для інших)
        const role = email === 'admin@pytna.ua' ? 'admin' : 'user';

        // Створення нового користувача
        const result = await db.query(
            'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role',
            [email, password, firstName, lastName, role]
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Користувач успішно зареєстрований',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Помилка при реєстрації:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// Вхід користувача
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await db.query(
            'SELECT id, email, role FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Невірний email або пароль' });
        }

        const user = result.rows[0];
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Успішний вхід',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Помилка при вході:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router; 