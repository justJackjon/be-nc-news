const commentsRouter = require('express').Router();
const { deleteCommentC, patchCommentC } = require('../controllers/comments-c');
const { send405Error } = require('../errors');

commentsRouter
  .route('/:comment_id')
  .delete(deleteCommentC)
  .patch(patchCommentC)
  .all(send405Error);

module.exports = commentsRouter;
