const connection = require('../db/connection');

const fetchTopicsM = () => {
  return connection
    .select()
    .from('topics')
    .returning('*')
    .then(topics => {
      return { topics };
    });
};

module.exports = {
  fetchTopicsM
};
