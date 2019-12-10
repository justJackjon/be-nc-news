const topicsRouter = require('express').Router();
const { getTopicsC } = require('../controllers/topics-c');
const { send405Error } = require('../errors');

topicsRouter
  .route('/')
  .get(getTopicsC)
  .all(send405Error);

module.exports = topicsRouter;
