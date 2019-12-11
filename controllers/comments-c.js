const {
  insertCommentM,
  selectCommentsM,
  removeCommentM
} = require('../models/comments-m');

exports.postCommentC = ({ params, body }, res, next) => {
  insertCommentM(params, body)
    .then(response => {
      res.status(201).send(response);
    })
    .catch(err => {
      next(err);
    });
};

exports.getCommentsC = ({ params, query }, res, next) => {
  selectCommentsM(params, query)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(err => {
      next(err);
    });
};

exports.deleteCommentC = (req, res, next) => {
  removeCommentM(req.params)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
};
