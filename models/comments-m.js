const connection = require('../db/connection');
const { fetchArticleM } = require('./articles-m');

const insertCommentM = ({ article_id }, { username, body }) => {
  return connection('comments')
    .insert({ author: username, article_id, body })
    .returning('*')
    .then(([comment]) => ({ comment }));
};

const selectCommentsM = (
  { article_id },
  { sort_by = 'created_at', order = 'desc', limit = 10, p = 1 }
) => {
  return fetchArticleM({ article_id }).then(() => {
    return connection
      .select()
      .from('comments')
      .where('article_id', '=', article_id)
      .modify(query => {
        const offset = (p - 1) * limit;
        if (offset) return query.offset(offset);
      })
      .orderBy(sort_by, order)
      .limit(limit)
      .returning('*')
      .then(comments => ({ comments }));
  });
};

const removeCommentM = ({ comment_id }) => {
  if (typeof +comment_id === 'number' && !isNaN(+comment_id)) {
    return connection('comments')
      .where('comment_id', '=', comment_id)
      .del()
      .then(rowsDeleted => {
        if (rowsDeleted) return;
        return Promise.reject({
          status: 404,
          message: 'No Comment Found, Nothing To Delete'
        });
      });
  }
  return Promise.reject({
    status: 400,
    message: 'Bad Request - Malformed comment_id'
  });
};

const updateCommentM = ({ comment_id }, { inc_votes = 0 }) => {
  if (
    typeof +comment_id === 'number' &&
    !isNaN(+comment_id) &&
    inc_votes <= 1 &&
    inc_votes >= -1
  ) {
    return connection('comments')
      .where('comment_id', '=', comment_id)
      .modify(query => {
        if (+inc_votes === 1) {
          query.increment('votes', 1);
        } else if (+inc_votes === -1) {
          query.decrement('votes', 1);
        }
      })
      .returning('*')
      .then(([comment]) => {
        if (comment) return { comment };
        return Promise.reject({
          status: 404,
          message: 'No Comment Found, Nothing To Patch'
        });
      });
  }
  return Promise.reject({
    status: 400,
    message: 'Bad Request'
  });
};

module.exports = {
  insertCommentM,
  selectCommentsM,
  removeCommentM,
  updateCommentM
};
