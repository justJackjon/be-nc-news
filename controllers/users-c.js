const { fetchUserM } = require('../models/users-m');

exports.getUserC = (req, res, next) => {
  fetchUserM(req.params)
    .then(user => {
      res.status(200).send({ user });
    })
    .catch(err => {
      console.log(err);
    });
};
