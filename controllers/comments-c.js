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

exports.getCommentsC = ({ query }, res, next) => {
  selectCommentsM(query)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(err => {
      next(err);
    });
};

exports.deleteCommentC = (req, res, next) => {
  removeCommentM(req.params)
    .then(amountDeleted => {
      if (amountDeleted) res.sendStatus(204);
      // else do something here
    })
    .catch(err => {
      next(err);
    });
};
