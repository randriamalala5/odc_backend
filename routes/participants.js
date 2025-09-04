const express = require('express');
const router = express.Router();
const { getAllParticipants, getParticipant } = require('../controllers/participantsController');
const { createParticipant } = require('../controllers/participantsController');
const { deleteParticipant } = require('../controllers/participantsController');
const { updateParticipant } = require('../controllers/participantsController');

const auth = require('../middlewares/auth');
const validateUser = require('../middlewares/validateUser');

router.post('/',auth, validateUser, createParticipant);
router.get('/', auth, getAllParticipants);
router.get('/:id',auth, getParticipant);
router.put('/:id',auth, updateParticipant);
router.delete('/:id',auth, deleteParticipant);
// router.get('/dbu', getAllDbUsers);


module.exports = router;
