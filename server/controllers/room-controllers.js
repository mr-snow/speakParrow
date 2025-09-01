const express = require('express');
const Room = require('../db/models/roomSchema');
const User = require('../db/models/userSchema');

const router = express.Router();

const mongoose = require('mongoose');

module.exports.create = async (req, res) => {
  try {
    const { user_id, room_name, country, language, member_limit } = req.body;
    if (!user_id) {
      return res.status(403).json({ message: 'User validation failed !' });
    }

    // Check if the room already exists
    const room_ac = await Room.findOne({ room_name: room_name });
    if (room_ac) {
      return res.status(400).json({ message: 'Room already exists' });
    }

    // Create the room with member_limit and an empty team_members array
    const response = await Room.create({
      room_name,
      user_id,
      language,
      country,
      member_limit, // Store the member limit
      team_members: [], // Initialize team members as an empty array
    });

    return res.status(201).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: e.message, page: 'room-controllers.js' });
  }
};

// module.exports.getRoomById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const room = await Room.findById(id);
//     if (!room) {
//       return res.status(404).json({ message: 'Room not found' });
//     }
//     return res.status(200).json({ message: room, error: false });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: error.message, page: 'room-controllers.js' });
//   }
// };

module.exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const { member_id } = req.query;
    if (!id || id === 'null' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Room is not Available' });
    }

    const room = await Room.findById(id).populate('team_members', 'username');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.status(200).json(room);
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, page: 'room-controllers.js' });
  }
};

module.exports.getRooms = async (req, res) => {
  try {
    const { user_id, room_name, language, country } = req.query;
    const customQuery = {};

    if (user_id) {
      customQuery.user_id = user_id;
    }
    if (room_name) {
      customQuery.room_name = room_name;
    }
    if (language) {
      const lanAr = language.split(',');
      customQuery.language = { $in: lanAr };
    }
    if (country) {
      const coAr = country.split(',');
      customQuery.country = { $in: coAr };
    }
    const response = await Room.find(customQuery);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.status(200).json(updatedRoom);
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, page: 'room-controllers.js' });
  }
};

module.exports.addMember = async (req, res) => {
  const { member_id } = req.body;
  const { room_id } = req.params;

  // Validate room_id format
  if (!mongoose.Types.ObjectId.isValid(room_id)) {
    return res.status(400).json({ message: 'Invalid room ID format' });
  }

  if (!member_id) {
    return res.status(400).json({ message: 'Member ID is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(member_id)) {
    return res.status(400).json({ message: 'Member ID is required' });
  } else {
    const user_ac = await User.findById(member_id);
    if (!user_ac) {
      return res.status(400).json({ message: 'User not Found !' });
    }
  }

  try {
    let room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (room.no_of_members >= room.member_limit) {
      return res.status(400).json({ message: 'Team is full!' });
    }

    // if (room.team_members.includes(member_id)) {
    //   return res.status(400).json({ message: 'User already in the team!' });
    // }

    const updatedRoom = await Room.findByIdAndUpdate(
      room_id,
      {
        $addToSet: { team_members: member_id },
        $inc: { no_of_members: 1 },
      },
      { new: true }
    );

    res.json({
      message: 'Well come To New Room!',
      room: updatedRoom,
    });
  } catch (err) {
    console.error('Error adding member:', err);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message });
  }
};

module.exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    await Room.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, page: 'room-controllers.js' });
  }
};

module.exports.exitRoom = async (req, res) => {
  try {
    const { room_id, member_id } = req.params;
    let isOwner = false;
    let isTeamMember = false;

    if (!room_id || !mongoose.Types.ObjectId.isValid(room_id)) {
      return res.status(404).json({ message: 'Room is Not Available' });
    }
    if (!member_id) {
      return res.status(404).json({ message: 'Member not Found' });
    }
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({ message: 'Room not Found' });
    }

    if (room.user_id === member_id) {
      isOwner = true;
      const deletedRoom = await Room.findOneAndDelete({ _id: room_id });
      return res.status(200).json({
        message: 'Room Deleted by Owner ',
        data: deletedRoom,
        isOwner,
        isTeamMember,
      });
    }
    if (room.team_members.includes(member_id)) {
      isTeamMember = true;
      const updatedRoom = await Room.findByIdAndUpdate(
        { _id: room_id },
        {
          $pull: {
            team_members: member_id,
          },
          $inc: { no_of_members: -1 },
        },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: 'Member Left from Room', data: updatedRoom });
    }

    return res.status(404).json({ message: 'Member not part of this room' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
