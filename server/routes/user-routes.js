const express = require('express');
const {
  userSignUp,
  userLogin,
  userLogout,
} = require('../controllers/user-controller');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', userSignUp);
router.post('/login', userLogin);
router.post('/logout', authenticateToken, userLogout);

module.exports = router;
