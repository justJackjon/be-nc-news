const { fetchUserM } = require('../models/users-m');

exports.getUserC = ({ params }, res, next) => {
  fetchUserM(params)
    .then(user => {
      res.status(200).send(user);
    })
    .catch(next);
};
