const express = require('express');
const router = express.Router();
const roomRoute = require('./room-routes');

try {
  router.use('/room', roomRoute);
} catch (e) {
  return res.status(500).json({ message: e, page: 'routes-index.js' });
}

module.exports = router;
