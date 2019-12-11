const connection = require('../db/connection');

const fetchTopicsM = slug => {
  return connection
    .select()
    .from('topics')
    .modify(query => {
      if (slug) {
        query.where('slug', '=', slug);
      }
    })
    .returning('*')
    .then(topics => {
      return { topics };
    });
};

module.exports = {
  fetchTopicsM
};
