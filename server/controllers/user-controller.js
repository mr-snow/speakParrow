const express = require('express');
const User = require('../db/models/userSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.userSignUp = async (req, res) => {
  try {
    const { username, email, password, country, language } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user_ac = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (user_ac) {
      if (user_ac.email === email) {
        throw new Error('Email already exists');
      }
      if (user_ac.username === username) {
        throw new Error('Username already exists');
      }
    }

    // Create the room with member_limit and an empty team_members array
    const response = await User.create({
      username,
      email,
      password: hashedPassword,
      country,
      language,
    });
    const token = jwt.sign({ id: email }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });
    console.log('key', process.env.JWT_SECRET_KEY);
    return res.status(201).json({ ...response.toObject(), token });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
