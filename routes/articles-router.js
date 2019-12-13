const articlesRouter = require('express').Router();
const {
  getArticleC,
  patchArticleC,
  getArticlesArrayC,
  postArticleC
} = require('../controllers/articles-c');
const { postCommentC, getCommentsC } = require('../controllers/comments-c');
const { send405Error } = require('../errors');

articlesRouter
  .route('/:article_id/comments')
  .post(postCommentC)
  .get(getCommentsC)
  .all(send405Error);

articlesRouter
  .route('/:article_id')
  .get(getArticleC)
  .patch(patchArticleC)
  .all(send405Error);

articlesRouter
  .route('/')
  .get(getArticlesArrayC)
  .post(postArticleC)
  .all(send405Error);

module.exports = articlesRouter;
