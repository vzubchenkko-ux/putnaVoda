const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Створення нового замовлення
router.post('/', auth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { items, pickup_datetime, payment_type, total_amount, payment_amount } = req.body;
        
        // Створюємо замовлення
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, pickup_datetime, payment_type, total_amount, payment_amount)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [req.user.id, pickup_datetime, payment_type, total_amount, payment_amount]
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
router.get('/history', auth, async (req, res) => {
    try {
        const result = await pool.query(
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
            [req.user.id]
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

module.exports = router; 