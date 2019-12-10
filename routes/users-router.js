const usersRouter = require('express').Router();
const { getUserC } = require('../controllers/users-c');
const { send405Error } = require('../errors');

usersRouter
  .route('/:username')
  .get(getUserC)
  .all(send405Error);

module.exports = usersRouter;
