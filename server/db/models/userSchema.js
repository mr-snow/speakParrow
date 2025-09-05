const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true, unique: true, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: { type: String, required: true },
    language: { type: [String], default: [] },
    country: { type: [String], default: [] },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('user', UserSchema);
