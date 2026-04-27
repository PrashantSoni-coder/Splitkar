const express            = require('express');
const router             = express.Router();
const activityController = require('../controllers/activityController');
const { isAuthenticated }= require('../middleware/auth');

router.use(isAuthenticated);
router.get('/', activityController.getActivity);

module.exports = router;
