const connection = require('../db/connection');
const { fetchTopicsM } = require('./topics-m');
const { fetchUserM } = require('./users-m');

const fetchArticleM = ({ article_id }) => {
  const articleData = connection
    .select()
    .from('articles')
    .where('article_id', '=', article_id)
    .returning('*');
  const commentsData = connection('comments')
    .count({ comment_count: '*' })
    .where('article_id', '=', article_id)
    .returning('*');

  return Promise.all([articleData, commentsData]).then(
    ([[articleData], [commentsData]]) => {
      if (!articleData) {
        return Promise.reject({ status: 404, message: 'No Such Article' });
      }
      return { ...articleData, ...commentsData };
    }
  );
};

// const updateArticleM = ({ article_id }, { inc_votes }) => {
//   return connection
//     .select('votes')
//     .from('articles')
//     .where('article_id', '=', article_id)
//     .returning('*')
//     .then(responseArr => {
//       if (!responseArr.length)
//         return Promise.reject({
//           status: 404,
//           message: 'No Such Article - Unable To Patch'
//         });
//       return responseArr;
//     })
//     .then(([{ votes }]) => {
//       const newVotes = votes + inc_votes;
//       return connection('articles')
//         .where('article_id', '=', article_id)
//         .update('votes', newVotes)
//         .returning('*')
//         .then(([article]) => {
//           return { article };
//         });
//     });
// };

const updateArticleM = ({ article_id }, { inc_votes }) => {
  if (
    typeof inc_votes !== 'number' &&
    isNaN(inc_votes) &&
    inc_votes !== undefined
  ) {
    return Promise.reject({
      status: 400,
      message: 'Bad Request - Invalid Format For inc_votes'
    });
  }
  return connection
    .select()
    .from('articles')
    .where('article_id', '=', article_id)
    .modify(query => {
      if (+inc_votes > 0) {
        query.increment('votes', +inc_votes);
      } else if (+inc_votes < 0) {
        query.decrement('votes', +inc_votes);
      }
    })
    .returning('*')
    .then(responseArr => {
      if (!responseArr.length)
        return Promise.reject({
          status: 404,
          message: 'No Such Article - Unable To Patch'
        });
      return responseArr;
    })
    .then(([article]) => {
      return { article };
    });
};

// const selectArticlesArrayM = ({
//   sort_by = 'created_at',
//   order = 'desc',
//   author,
//   topic
// }) => {
//   if (order !== 'asc' && order !== 'desc') order = 'desc';
//   return connection
//     .select()
//     .from('articles')
//     .modify(query => {
//       if (author) return query.where('author', '=', author);
//     })
//     .modify(query => {
//       if (topic) return query.where('topic', '=', topic);
//     })
//     .orderBy(sort_by, order)
//     .returning('*')
//     .then(rawArticles => {
//       if (!rawArticles.length) {
//         return Promise.reject({
//           status: 404,
//           message: 'No Articles Found For This Query'
//         });
//       }
//       const articleArrPromises = rawArticles.map(article => {
//         return connection('comments')
//           .count({ comment_count: '*' })
//           .where('article_id', '=', article.article_id)
//           .returning('*')
//           .then(([count]) => {
//             count.comment_count = +count.comment_count;
//             return { ...article, ...count };
//           });
//       });
//       return Promise.all(articleArrPromises);
//     })
//     .then(articles => {
//       return { articles };
//     });
// };

// const selectArticlesArrayM = ({
//   sort_by = 'created_at',
//   order = 'desc',
//   author,
//   topic
// }) => {
//   if (order !== 'asc' && order !== 'desc') order = 'desc';
//   return connection
//     .select('articles.*')
//     .from('articles')
//     .leftJoin('comments', 'articles.article_id', 'comments.article_id')
//     .count('comment_id as comment_count')
//     .groupBy('articles.article_id')
//     .modify(query => {
//       if (author) return query.where('articles.author', '=', author);
//     })
//     .modify(query => {
//       if (topic) return query.where('topic', '=', topic);
//     })
//     .orderBy(sort_by, order)
//     .returning('*')
//     .then(articles => {
//       if (!articles.length) {
//         return Promise.reject({
//           status: 404,
//           message: 'No Articles Found For This Query'
//         });
//       } else {
//         articles.forEach(article => {
//           delete article.body;
//         });
//       }
//       return { articles };
//     });
// };

// const selectArticlesArrayM = ({
//   sort_by = 'created_at',
//   order = 'desc',
//   author,
//   topic
// }) => {
//   if (order !== 'asc' && order !== 'desc') order = 'desc';
//   return connection
//     .select('articles.*')
//     .from('articles')
//     .leftJoin('comments', 'articles.article_id', 'comments.article_id')
//     .count('comment_id as comment_count')
//     .groupBy('articles.article_id')
//     .modify(query => {
//       if (author) return query.where('articles.author', '=', author);
//     })
//     .modify(query => {
//       if (topic) return query.where('topic', '=', topic);
//     })
//     .orderBy(sort_by, order)
//     .returning('*')
//     .then(articles => {
//       if (articles.length) {
//         articles.forEach(article => {
//           delete article.body;
//         });
//       }
//       return { articles };
//     });
// };

// const selectArticlesArrayM = ({
//   sort_by = 'created_at',
//   order = 'desc',
//   author,
//   topic
// }) => {
//   if (order !== 'asc' && order !== 'desc') order = 'desc';
//   return fetchTopicsM(topic).then(({ topics }) => {
//     if (topics.length) {
//       return connection
//         .select('articles.*')
//         .from('articles')
//         .leftJoin('comments', 'articles.article_id', 'comments.article_id')
//         .count('comment_id as comment_count')
//         .groupBy('articles.article_id')
//         .modify(query => {
//           if (author) return query.where('articles.author', '=', author);
//         })
//         .modify(query => {
//           if (topic) return query.where('topic', '=', topic);
//         })
//         .orderBy(sort_by, order)
//         .returning('*')
//         .then(articles => {
//           if (articles.length) {
//             articles.forEach(article => {
//               delete article.body;
//             });
//           }
//           return { articles };
//         });
//     }
//     return Promise.reject({ status: 404, message: 'Topic Not Found' });
//   });
// };

const selectArticlesArrayM = ({
  sort_by = 'created_at',
  order = 'desc',
  author,
  topic
}) => {
  if (order !== 'asc' && order !== 'desc') order = 'desc';
  return fetchTopicsM(topic)
    .then(({ topics }) => {
      if (topics.length) return;
      return Promise.reject({ status: 404, message: 'Topic Not Found' });
    })
    .then(() => {
      if (!author) return;
      return fetchUserM({ username: author }).then(author => {
        if (author) return;
      });
    })
    .then(() => {
      return connection
        .select('articles.*')
        .from('articles')
        .leftJoin('comments', 'articles.article_id', 'comments.article_id')
        .count('comment_id as comment_count')
        .groupBy('articles.article_id')
        .modify(query => {
          if (author) return query.where('articles.author', '=', author);
        })
        .modify(query => {
          if (topic) return query.where('topic', '=', topic);
        })
        .orderBy(sort_by, order)
        .returning('*')
        .then(articles => {
          if (articles.length) {
            articles.forEach(article => {
              delete article.body;
            });
          }
          return { articles };
        });
    });
};

module.exports = {
  fetchArticleM,
  updateArticleM,
  selectArticlesArrayM
};
