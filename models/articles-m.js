const connection = require('../db/connection');

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
      if (articleData) {
        commentsData.comment_count = +commentsData.comment_count;
        return { ...articleData, ...commentsData };
      }
      return Promise.reject({ status: 404, message: 'No Such Article' });
    }
  );
};

const updateArticleM = ({ article_id }, { inc_votes }) => {
  return connection
    .select('votes')
    .from('articles')
    .where('article_id', '=', article_id)
    .returning('*')
    .then(responseArr => {
      if (!responseArr.length)
        return Promise.reject({
          status: 404,
          message: 'No Such Article - Unable To Patch'
        });
      return responseArr;
    })
    .then(([{ votes }]) => {
      const newVotes = votes + inc_votes;
      return connection('articles')
        .where('article_id', '=', article_id)
        .update('votes', newVotes)
        .returning('*')
        .then(([article]) => {
          return { article };
        });
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

const selectArticlesArrayM = ({
  sort_by = 'created_at',
  order = 'desc',
  author,
  topic
}) => {
  if (order !== 'asc' && order !== 'desc') order = 'desc';
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
      if (!articles.length) {
        return Promise.reject({
          status: 404,
          message: 'No Articles Found For This Query'
        });
      } else {
        articles.forEach(article => {
          article.comment_count = +article.comment_count;
          delete article.body;
        });
      }
      return { articles };
    });
};

module.exports = {
  fetchArticleM,
  updateArticleM,
  selectArticlesArrayM
};
