

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

