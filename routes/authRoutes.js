const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const registerValidation = [body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'), body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'), body('confirmPassword').custom((value, { req }) => {
  if (value !== req.body.password) throw new Error('Passwords do not match');
  return true;
})
];

const loginValidation = [body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(), body('password').notEmpty().withMessage('Password is required')];

router.get('/', (req, res) => res.redirect(req.session.user ? '/dashboard' : '/login'));
router.get('/register', authController.getRegister);
router.post('/register', authLimiter, registerValidation, authController.postRegister);
router.get('/login', authController.getLogin);
router.post('/login', authLimiter, loginValidation, authController.postLogin);
router.get('/logout', isAuthenticated, authController.logout);
router.get('/dashboard', isAuthenticated, authController.getDashboard);

module.exports = router;
