const usersRouter = require('express').Router();
const {
  getUserC,
  getUsersArrayC,
  postUserC
} = require('../controllers/users-c');
const { send405Error } = require('../errors');

usersRouter
  .route('/:username')
  .get(getUserC)
  .all(send405Error);

usersRouter
  .route('/')
  .get(getUsersArrayC)
  .post(postUserC)
  .all(send405Error);

module.exports = usersRouter;
