const { fetchTopicsM } = require('../models/topics-m');

exports.getTopicsC = (req, res, next) => {
  fetchTopicsM()
    .then(topics => {
      res.status(200).send(topics);
    })
    .catch(next);
};
