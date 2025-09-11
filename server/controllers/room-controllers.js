const Room = require('../db/models/roomSchema');
const User = require('../db/models/userSchema');
const mongoose = require('mongoose');

module.exports.create = async (req, res) => {
  const allowedRoles = ['user', 'admin', 'superAdmin'];
  try {
    const { user_id, room_name, country, language, member_limit } = req.body;
    if (!user_id) {
      return res.status(403).json({ message: 'User validation failed !' });
    }
    const room_ac = await Room.findOne({ room_name: room_name });
    if (room_ac) {
      return res.status(400).json({ message: 'Room already exists' });
    }
    if (!allowedRoles.includes(req?.user?.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    const response = await Room.create({
      room_name,
      user_id,
      language,
      country,
      member_limit,
      team_members: [],
    });

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
    const { member_id } = req.query;
    let isOwner = false;
    let isTeamMember = false;

    if (!id || id === 'null' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Room is not Available' });
    }
    if (member_id && !mongoose.Types.ObjectId.isValid(member_id)) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    const room = await Room.findById(id)
      .populate('team_members', 'username')
      .populate('user_id', 'username');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is owner (only if member_id is provided and valid)
    if (member_id && mongoose.Types.ObjectId.isValid(member_id)) {
      const memberObjectId = new mongoose.Types.ObjectId(member_id);

      if (room.user_id._id.equals(memberObjectId)) {
        isOwner = true;
      } else {
        isTeamMember = room.team_members.some(member =>
          member._id.equals(memberObjectId)
        );
      }
    }

    return res.status(200).json({ room, isTeamMember, isOwner });
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
    const response = await Room.find(customQuery).populate(
      'user_id',
      'username'
    );
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
  allowedRoles = ['user', 'admin', 'superAdmin'];
  const { member_id } = req.body;
  const { room_id } = req.params;

  // Validate room_id format
  if (!mongoose.Types.ObjectId.isValid(room_id)) {
    return res.status(400).json({ message: 'Invalid room ID format' });
  }

  if (!member_id) {
    return res.status(400).json({ message: 'Member ID is required' });
  }

  if (!allowedRoles.includes(req?.user?.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
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

    const memberObjectId = new mongoose.Types.ObjectId(member_id);
    if (room.user_id.equals(memberObjectId)) {
      isOwner = true;
      const roomAfterRemoval = await Room.findByIdAndUpdate(
        room_id,
        {
          $pull: { team_members: memberObjectId },
          $inc: {
            no_of_members: -1,
          },
        },
        { new: true }
      );

      if (
        roomAfterRemoval.team_members &&
        roomAfterRemoval.team_members.length > 0
      ) {
        const newOwnerId = roomAfterRemoval.team_members[0];

        const updatedRoom = await Room.findByIdAndUpdate(
          room_id,
          {
            $set: { user_id: newOwnerId },
          },
          { new: true }
        )
          .populate('user_id', 'username')
          .populate('team_members', 'username');

        return res.status(200).json({
          message: 'Owner Left from Room',
          data: updatedRoom,
          isOwner,
          isTeamMember,
        });
      } else {
        const deletedRoom = await Room.findOneAndDelete({ _id: room_id });
        return res.status(200).json({
          message: 'Room Deleted by Owner ',
          data: deletedRoom,
          isOwner,
          isTeamMember,
        });
      }
    }
    if (
      room.team_members.some(member => member.equals(memberObjectId)) &&
      isOwner === false
    ) {
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
      )
        .populate('user_id', 'username')
        .populate('team_members', 'username');

      return res.status(200).json({
        message: 'Member Left from Room2',
        data: updatedRoom,
        isOwner,
        isTeamMember,
      });
    }
    return res.status(404).json({ message: 'Member not part of this room' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.removeMember = async (req, res) => {
  try {
    const { room_id, owner_id } = req.params;
    const { member_id } = req.body;
    if (!room_id || !owner_id || !member_id) {
      return res.status(404).json({ message: 'Not found ! ' });
    }
    const room = await Room.findByIdAndUpdate(
      room_id,
      {
        $pull: { team_members: member_id },
        $inc: { no_of_members: -1 },
      },
      { new: true }
    );
    const io = req.app.get('io');
    if (io) {
      io.to(room_id).emit('member-removed', {
        memberId: member_id,
        removedBy: owner_id,
      });
    }
    if (io) {
      io.to(member_id).emit('you-were-removed', {
        roomId: room_id,
        removedBy: owner_id,
      });
    }
    return res
      .status(200)
      .json({ message: 'user removed by Owner ', data: room });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

 
