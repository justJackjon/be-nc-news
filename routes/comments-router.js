const commentsRouter = require('express').Router();
const { deleteCommentC } = require('../controllers/comments-c');
const { send405Error } = require('../errors');

commentsRouter
  .route('/:comment_id')
  .delete(deleteCommentC)
  .all(send405Error);

module.exports = commentsRouter;
