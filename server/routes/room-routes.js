const exprss = require('express');
const {
  create,
  getRoomById,
  getRooms,
  deleteRoom,
  updateRoom,
  addMember,
} = require('../controllers/room-controllers');

const router = exprss.Router();

router.post('/host', create);
router.get('/list', getRooms);
router.get('/:id', getRoomById);
router.patch('/:id', updateRoom);
router.delete('/:id', deleteRoom);
router.patch('/add-member/:room_id', addMember);
module.exports = router;
