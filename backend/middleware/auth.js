const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

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
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Помилка перевірки токена:', error);
        return res.status(401).json({ message: 'Недійсний токен' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Доступ заборонено. Необхідні права адміністратора.' });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin,
    JWT_SECRET
}; 