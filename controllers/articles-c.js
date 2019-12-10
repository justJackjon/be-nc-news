const {
  fetchArticleM,
  updateArticleM,
  selectArticlesArrayM
} = require('../models/articles-m');

exports.getArticleC = ({ params }, res, next) => {
  fetchArticleM(params)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(err => {
      next(err);
    });
};

exports.patchArticleC = ({ params, body }, res, next) => {
  updateArticleM(params, body)
    .then(article => {
      res.status(200).send(article);
    })
    .catch(err => {
      next(err);
    });
};

exports.getArticlesArrayC = ({ query }, res, next) => {
  selectArticlesArrayM(query)
    .then(articles => {
      res.status(200).send(articles);
    })
    .catch(err => {
      next(err);
    });
};
