const express = require('express');
const {  create,  getRoomById,  getRooms,  deleteRoom, 
   updateRoom,  addMember,  exitRoom,  removeMember,
} = require('../controllers/room-controllers');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/host', authenticateToken, create);
router.get('/list', getRooms);
router.get('/:id', authenticateToken, getRoomById);
router.patch('/:id', updateRoom);
router.delete('/:id', deleteRoom);
router.patch('/add-member/:room_id', authenticateToken, addMember);
router.delete('/:room_id/member/:member_id', authenticateToken, exitRoom);
router.delete('/:room_id/owner/:owner_id', authenticateToken, removeMember);
module.exports = router;


