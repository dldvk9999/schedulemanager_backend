const router = require('express').Router();
const user = require('../controller/user_controller.ts');
const schedule = require('../controller/schedule_controller.ts');

// User Create
router.post('/api/user', user.create);

// User Find All
router.post('/api/user/findall', user.findAll);

// User Find One
router.post('/api/user/find/', user.findOne);

// Login
router.post('/api/user/login', user.login);

// Login_Check
router.post('/api/user/login_check', user.login_check);

// Logout
router.post('/api/user/logout', user.logout);

// User Update
router.put('/api/user/:email', user.update);

// User Delete
router.delete('/api/user/:email', user.delete);

// Schedule Create
router.post('/api/schedule', schedule.create);

// Schedule Update
router.put('/api/schedule', schedule.update);

// Schedule Delete
router.delete('/api/schedule', schedule.delete);

// Schedule Search
router.post('/api/schedule/get', schedule.get);

module.exports = router;