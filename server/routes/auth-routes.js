const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/validate', authenticateToken, (req, res) => {
  return res.status(200).json({ message: 'Token is Valid', user: req.user });
});

module.exports = router;
