const exprss = require('express');
const {
  create,
  getRoomById,
  getRooms,
  deleteRoom,
  updateRoom,
} = require('../controllers/room-controllers');

const router = exprss.Router();

router.post('/host', create);
router.get('/:id', getRoomById);
router.get('/', getRooms);
router.patch('/:id', updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;
