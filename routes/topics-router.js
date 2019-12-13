const topicsRouter = require('express').Router();
const { getTopicsC, postTopicC } = require('../controllers/topics-c');
const { send405Error } = require('../errors');

topicsRouter
  .route('/')
  .get(getTopicsC)
  .post(postTopicC)
  .all(send405Error);

module.exports = topicsRouter;
