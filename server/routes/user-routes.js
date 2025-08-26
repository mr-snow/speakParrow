const express = require('express');
const { userSignUp } = require('../controllers/user-controller');

const router = express.Router();

router.post('/signup', userSignUp);

module.exports = router;
