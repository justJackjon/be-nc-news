const {
  insertCommentM,
  selectCommentsM,
  removeCommentM,
  updateCommentM
} = require('../models/comments-m');

exports.postCommentC = ({ params, body }, res, next) => {
  insertCommentM(params, body)
    .then(comment => {
      res.status(201).send(comment);
    })
    .catch(err => {
      next(err);
    });
};

exports.getCommentsC = ({ params, query }, res, next) => {
  selectCommentsM(params, query)
    .then(comments => {
      res.status(200).send(comments);
    })
    .catch(err => {
      next(err);
    });
};

exports.deleteCommentC = ({ params }, res, next) => {
  removeCommentM(params)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
};

exports.patchCommentC = ({ params, body }, res, next) => {
  updateCommentM(params, body)
    .then(comment => {
      res.status(200).send(comment);
    })
    .catch(err => {
      next(err);
    });
};
