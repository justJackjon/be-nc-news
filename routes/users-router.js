const usersRouter = require('express').Router();
const { getUserC } = require('../controllers/users-c');

usersRouter.route('/:username').get(getUserC);

module.exports = usersRouter;
