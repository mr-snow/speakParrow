const mongoose = require('mongoose');
const roomSchema = mongoose.Schema(
  {
    room_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    user_id: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: [String],
      required: true,
      default: ['India'],
    },
    language: {
      type: [String],
      required: true,
      default: ['English'],
    },
    role: {
      type: String,
      default: 'USER',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

const ROOM = mongoose.model('room', roomSchema);

module.exports = ROOM;
