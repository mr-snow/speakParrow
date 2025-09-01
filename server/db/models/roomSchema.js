const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  room_name: { type: String, required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  language: { type: [String], default: [] },
  country: { type: [String], default: [] },
  team_members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  no_of_members: { type: Number, default: 0 }, // Current number of members
  member_limit: { type: Number, default: 5 }, // Maximum members allowed
});

module.exports = mongoose.model('room', RoomSchema);
