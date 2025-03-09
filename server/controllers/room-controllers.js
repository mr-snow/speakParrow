const express = require('express');
const Room = require('../db/models/roomSchema');
const ROOM = require('../db/models/roomSchema');
const router = express.Router();
const mongoose = require('mongoose');

module.exports.create = async (req, res) => {
  try {
    const { user_id, room_name } = req.body;
    const room_ac = await Room.findOne({ room_name: room_name });
    if (room_ac) {
      return res.status(400).json({ message: 'Already exist' });
    }
    const response = await Room.create({ room_name, user_id });
    return res.status(201).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: e.message, page: 'room-controllers.js' });
  }
};

module.exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await ROOM.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.status(200).json({ message: room, error: false });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, page: 'room-controllers.js' });
  }
};

module.exports.getRooms = async (req, res) => {
  try {
    const { user_id, room_name, languages, country } = req.query;
    const customQuery = {};

    if (user_id) {
      customQuery.user_id = user_id;
    }
    if (room_name) {
      customQuery.room_name = room_name;
    }
    if (languages) {
      const lanAr = languages.split(',');
      customQuery.languages = { $in: lanAr };
    }
    if (country) {
      const coAr = country.split(',');
      customQuery.country = { $in: coAr };
    }
    const response = await ROOM.find(customQuery);
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
