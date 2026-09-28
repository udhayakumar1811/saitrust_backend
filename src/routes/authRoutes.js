const express = require('express');
const router = express.Router();
const { login, register, adminLogin, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');

router.post('/auth/login', authLimiter, login);
router.post('/auth/register', authLimiter, register);
router.post('/admin/auth/login', authLimiter, adminLogin);
router.get('/auth/me', protect, me);

module.exports = router;
