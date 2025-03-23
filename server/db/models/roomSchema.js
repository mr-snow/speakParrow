// const mongoose = require('mongoose');
// const roomSchema = mongoose.Schema(
//   {
//     room_name: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true,
//     },
//     user_id: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     country: {
//       type: [String],
//       required: true,
//       default: ['India'],
//     },
//     language: {
//       type: [String],
//       required: true,
//       default: ['English'],
//     },
//     role: {
//       type: String,
//       default: 'USER',
//       required: true,
//       immutable: true,
//     },
//   },
//   { timestamps: true }
// );

// const ROOM = mongoose.model('room', roomSchema);

// module.exports = ROOM;

const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  room_name: { type: String, required: true },
  user_id: { type: String, required: true },
  language: { type: [String], default: [] },
  country: { type: [String], default: [] },
  team_members: { type: [String], default: [] }, // Array of team member IDs
  no_of_members: { type: Number, default: 0 }, // Current number of members
  member_limit: { type: Number, default: 5 }, // Maximum members allowed
});

module.exports = mongoose.model('room', RoomSchema);
