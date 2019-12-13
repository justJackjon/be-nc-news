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
      const article = { ...articleData, ...commentsData };
      return { article };
    }
  );
};

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

const selectArticlesArrayM = ({
  sort_by = 'created_at',
  order = 'desc',
  author,
  topic,
  limit = 10,
  p = 1
}) => {
  if (order !== 'asc' && order !== 'desc') order = 'desc';
  return fetchTopicsM(topic) // <-- add logic to skip this step if topic is undefined.
    .then(() => {
      if (!author) return;
      return fetchUserM({ username: author });
    })
    .then(() => {
      return (
        connection
          .select('articles.*')
          .from('articles')
          .leftJoin('comments', 'articles.article_id', 'comments.article_id')
          // .count('articles.article_id as total_count')
          .count('comment_id as comment_count')
          .groupBy('articles.article_id')
          .modify(query => {
            if (author) return query.where('articles.author', '=', author);
            if (topic) return query.where('topic', '=', topic);
            // const offset = (p - 1) * limit;
            // if (offset) return query.offset(offset);
          })
          .orderBy(sort_by, order)
          // .limit(limit)
          .returning('*')
          .then(articles => {
            const totalCount = articles.length;
            if (totalCount) {
              const start = (p - 1) * limit;
              articles = articles.slice(start, start + +limit);
              articles.forEach(article => {
                article.total_count = totalCount;
                delete article.body;
              });
            }
            return { articles };
          })
      );
    });
};

const insertArticleM = ({ author, topic, title, body }) => {
  return connection('articles')
    .insert({ author, topic, title, body })
    .returning('*')
    .then(([article]) => {
      return { article };
    });
};

module.exports = {
  fetchArticleM,
  updateArticleM,
  selectArticlesArrayM,
  insertArticleM
};
