const express = require('express');
const router = express.Router();
const { getAllUsers, getUser } = require('../controllers/usersController');
// const { getAllDbUsers } = require('../controllers/usersController');
const { createUser } = require('../controllers/usersController');
const { loginUser } = require('../controllers/usersController');
const validateUser = require('../middlewares/validateUser');

router.get('/', getAllUsers);
// router.get('/dbu', getAllDbUsers);
router.post('/',validateUser, createUser);
router.post('/login', loginUser);
router.get('/:id', getUser);

module.exports = router;
