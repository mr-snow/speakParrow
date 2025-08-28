const express = require('express');
const {
  userSignUp,
  userLogin,
  userLogout,
} = require('../controllers/user-controller');


const router = express.Router();

router.post('/signup', userSignUp);
router.post('/login', userLogin);
router.post('/logout', userLogout);

module.exports = router;
