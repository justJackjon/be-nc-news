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
      } else {
        return Promise.reject({ status: 404, message: 'Not Found' });
      }
    }
  );
};

const updateArticleM = ({ article_id }, { inc_votes }) => {
  return connection
    .select('votes')
    .from('articles')
    .where('article_id', '=', article_id)
    .returning('*')
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

const selectArticlesArrayM = ({
  sort_by = 'created_at',
  order = 'desc',
  author,
  topic
}) => {
  if (order !== 'asc' && order !== 'desc') order = 'desc';
  return connection
    .select()
    .from('articles')
    .modify(query => {
      if (author) return query.where('author', '=', author);
    })
    .modify(query => {
      if (topic) return query.where('topic', '=', topic);
    })
    .orderBy(sort_by, order)
    .returning('*')
    .then(rawArticles => {
      if (!rawArticles.length) {
        return Promise.reject({
          status: 404,
          message: 'No Articles Found For This Query'
        });
      }
      const articleArrPromises = rawArticles.map(article => {
        return connection('comments')
          .count({ comment_count: '*' })
          .where('article_id', '=', article.article_id)
          .returning('*')
          .then(([count]) => {
            count.comment_count = +count.comment_count;
            return { ...article, ...count };
          });
      });
      return Promise.all(articleArrPromises);
    })
    .then(articles => {
      return { articles };
    });
};

module.exports = {
  fetchArticleM,
  updateArticleM,
  selectArticlesArrayM
};
