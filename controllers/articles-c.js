const { fetchArticleM, updateArticleM } = require('../models/articles-m');

exports.getArticleC = (req, res, next) => {
  fetchArticleM(req.params)
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
