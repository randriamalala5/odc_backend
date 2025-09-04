const express = require('express');
const router = express.Router();
const { getAllUsers, getUser } = require('../controllers/usersController');
// const { getAllDbUsers } = require('../controllers/usersController');
const { createUser } = require('../controllers/usersController');
const { deleteUser } = require('../controllers/usersController');
const { updateUser } = require('../controllers/usersController');
// const { loginUser } = require('../controllers/usersController');

const auth = require('../middlewares/auth');
const validateUser = require('../middlewares/validateUser');

router.post('/',auth, validateUser, createUser);
router.get('/', auth, getAllUsers);
router.get('/:id',auth, getUser);
router.put('/:id',auth, updateUser);
router.delete('/:id',auth, deleteUser);
// router.post('/login', loginUser);
// router.get('/dbu', getAllDbUsers);


module.exports = router;
