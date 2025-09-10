const express = require('express');
const User = require('../db/models/userSchema');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');


require('dotenv').config();

module.exports.userSignUp = async (req, res) => {
  try {
    const { username, email, password,country, language, role = 'user'} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user_ac = await User.findOne({
      $or: [{ email }, { username }],  });

    if (user_ac) {
      if (user_ac.email === email) {
        throw new Error('Email already exists');
      }
      if (user_ac.username === username) {
        throw new Error('Username already exists');
      }
    }
    const response = await User.create({ username, email,password: hashedPassword,
       country,language,role,
    });
    const token = jwt.sign(
      { id: response._id, role: response.role },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: '1d',
      }
    );
    return res.status(201).json({ ...response.toObject(), token });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Fill the data correctly');
    }
    const user_ac = await User.findOne({ $or: [{ email }, { username: email }], });
    if (!user_ac) {
      throw new Error('Invalide email');
    }
    const isMatch = await bcrypt.compare(password, user_ac.password);
    if (!isMatch) {
      throw new Error('Invalide Password');
    }

    const token = jwt.sign(
      { id: user_ac._id, role: user_ac.role },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: '1d',
      }
    );
    return res.status(200).json({ ...user_ac.toObject(), token });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports.userLogout = async (req, res) => {
  return res.status(200).json({ message: 'Logout Successful' });
};


