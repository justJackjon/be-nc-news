const {
  fetchUserM,
  selectUsersArrayM,
  insertUserM
} = require('../models/users-m');

exports.getUserC = ({ params }, res, next) => {
  fetchUserM(params)
    .then(user => {
      res.status(200).send(user);
    })
    .catch(next);
};

exports.getUsersArrayC = (req, res, next) => {
  selectUsersArrayM()
    .then(users => {
      res.status(200).send(users);
    })
    .catch(next);
};

exports.postUserC = ({ body }, res, next) => {
  insertUserM(body)
    .then(user => {
      res.status(201).send(user);
    })
    .catch(next);
};
