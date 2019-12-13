const {
  fetchArticleM,
  updateArticleM,
  selectArticlesArrayM,
  insertArticleM
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

exports.postArticleC = (req, res, next) => {
  console.log('in the postArticleC controller');
  insertArticleM();
};
