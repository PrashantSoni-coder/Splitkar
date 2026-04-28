const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const authController  = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/auth');
const { authLimiter }  = require('../middleware/rateLimiter');
const { handleValidation } = require('../middleware/validate');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match');
    return true;
  })
];

const loginRules = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// router.get('/',         (req, res) => res.redirect(req.session.user ? '/dashboard' : '/login'));
router.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('index', { title: 'Home', layout: false });
});
router.get('/register', isGuest, authController.getRegister);
router.post('/register',isGuest, authLimiter, registerRules, handleValidation, authController.postRegister);
router.get('/login',    isGuest, authController.getLogin);
router.post('/login',   isGuest, authLimiter, loginRules, handleValidation, authController.postLogin);
router.get('/logout',   isAuthenticated, authController.logout);
router.get('/dashboard',isAuthenticated, authController.getDashboard);

module.exports = router;
