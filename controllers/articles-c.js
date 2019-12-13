const {
  fetchArticleM,
  updateArticleM,
  selectArticlesArrayM,
  insertArticleM,
  removeArticleM
} = require('../models/articles-m');

exports.getArticleC = ({ params }, res, next) => {
  fetchArticleM(params)
    .then(article => {
      res.status(200).send(article);
    })
    .catch(next);
};

exports.patchArticleC = ({ params, body }, res, next) => {
  updateArticleM(params, body)
    .then(article => {
      res.status(200).send(article);
    })
    .catch(next);
};

exports.getArticlesArrayC = ({ query }, res, next) => {
  selectArticlesArrayM(query)
    .then(articles => {
      res.status(200).send(articles);
    })
    .catch(next);
};

exports.postArticleC = ({ body }, res, next) => {
  insertArticleM(body)
    .then(article => {
      res.status(201).send(article);
    })
    .catch(next);
};

exports.deleteArticleC = ({ params }, res, next) => {
  removeArticleM(params)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
