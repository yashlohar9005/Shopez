const express = require('express');
const router = express.Router();

const {
  getUsers,
  updateUserRole,
  toggleUserStatus
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');

// All user routes are restricted to Admin
router.use(protect);
router.use(authorizeAdmin);

router.route('/')
  .get(getUsers);

router.route('/:id/role')
  .put(updateUserRole);

router.route('/:id/status')
  .put(toggleUserStatus);

module.exports = router;
