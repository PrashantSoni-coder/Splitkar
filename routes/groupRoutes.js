const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const groupController   = require('../controllers/groupController');
const expenseController = require('../controllers/expenseController');
const { isAuthenticated } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

const groupRules = [
  body('name').trim().notEmpty().withMessage('Group name is required').isLength({ max: 60 }).withMessage('Name too long'),
  body('description').trim().isLength({ max: 200 }).withMessage('Description too long')
];

router.use(isAuthenticated);

router.get('/',            groupController.getGroups);
router.get('/new',         groupController.getNewGroup);
router.post('/',           groupRules, handleValidation, groupController.postCreateGroup);
router.get('/:id',         groupController.getGroup);
router.post('/:id/invite', groupController.inviteMember);
router.delete('/:id',      groupController.deleteGroup);

module.exports = router;
