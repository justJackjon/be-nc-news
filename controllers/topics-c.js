const { fetchTopicsM, insertTopicM } = require('../models/topics-m');

exports.getTopicsC = (req, res, next) => {
  fetchTopicsM()
    .then(topics => {
      res.status(200).send(topics);
    })
    .catch(next);
};

exports.postTopicC = ({ body }, res, next) => {
  insertTopicM(body)
    .then(topic => {
      res.status(201).send(topic);
    })
    .catch(next);
};
