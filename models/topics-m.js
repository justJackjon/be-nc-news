const connection = require('../db/connection');

const fetchTopicsM = () => {
  return connection
    .select()
    .from('topics')
    .returning('*');
};

module.exports = {
  fetchTopicsM
};
