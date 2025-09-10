const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, getProfile } = require('../controllers/sbusersController');// require('../controllers/utilisateursController');
// const { getAllDbUsers } = require('../controllers/usersController');
const { createUser } = require('../controllers/sbusersController'); // require('../controllers/utilisateursController');
const { deleteUser } = require('../controllers/sbusersController'); // require('../controllers/utilisateursController');
const { updateUser } = require('../controllers/sbusersController'); // require('../controllers/utilisateursController');
// const { loginUser } = require('../controllers/usersController');

const auth = require('../middlewares/auth');
const validateUser = require('../middlewares/validateUser');

router.post('/', validateUser, createUser);
router.get('/', getAllUsers);
router.get('/profile', auth, getProfile);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
// router.post('/login', loginUser);
// router.get('/dbu', getAllDbUsers);

module.exports = router;
