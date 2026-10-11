const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  demoLogin,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);

module.exports = router;
