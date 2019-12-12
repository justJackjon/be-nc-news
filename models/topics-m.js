const connection = require('../db/connection');

// const fetchTopicsM = slug => {
//   return connection
//     .select()
//     .from('topics')
//     .modify(query => {
//       if (slug) {
//         query.where('slug', '=', slug);
//       }
//     })
//     .returning('*')
//     .then(topics => {
//       return { topics };
//     });
// };

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
      if (topics.length) return { topics };
      return Promise.reject({ status: 404, message: 'Topic Not Found' });
    });
};

module.exports = {
  fetchTopicsM
};
