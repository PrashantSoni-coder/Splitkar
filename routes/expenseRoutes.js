const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const expenseController   = require('../controllers/expenseController');
const { isAuthenticated } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

const expenseRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title too long'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('groupId').notEmpty().withMessage('Group is required')
];

router.use(isAuthenticated);

router.post('/',           expenseRules, handleValidation, expenseController.postCreateExpense);
router.post('/:id/settle', expenseController.settleExpense);
router.delete('/:id',      expenseController.deleteExpense);

module.exports = router;
