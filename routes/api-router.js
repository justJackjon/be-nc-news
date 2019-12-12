const apiRouter = require('express').Router();
const topicsRouter = require('./topics-router');
const usersRouter = require('./users-router');
const articlesRouter = require('./articles-router');
const commentsRouter = require('./comments-router');
const { send405Error } = require('../errors');
const { getEndpointsC } = require('../controllers/api-c');

apiRouter.use('/topics', topicsRouter);

apiRouter.use('/users', usersRouter);

apiRouter.use('/articles', articlesRouter);

apiRouter.use('/comments', commentsRouter);

apiRouter
  .route('/')
  .get(getEndpointsC)
  .all(send405Error);

module.exports = apiRouter;
