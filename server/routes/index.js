const express = require('express');
const router = express.Router();
const roomRoute = require('./room-routes');
const userRoute = require('./user-routes');
const authRoute = require('./auth-routes')

try {
  router.use('/room', roomRoute);
  router.use('/user', userRoute);
  router.use('/auth',authRoute)
} catch (e) {
  return res.status(500).json({ message: e, page: 'routes-index.js' });
}

module.exports = router;
