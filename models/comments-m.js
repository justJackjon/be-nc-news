const connection = require('../db/connection');

const insertCommentM = ({ article_id }, { username, body }) => {
  return connection('comments')
    .insert({ author: username, article_id, body })
    .returning('*')
    .then(([comment]) => {
      return { comment };
    });
};

const selectCommentsM = (
  { article_id },
  { sort_by = 'created_at', order = 'desc' }
) => {
  return connection
    .select()
    .from('comments')
    .where('article_id', '=', article_id)
    .orderBy(sort_by, order)
    .returning('*')
    .then(comments => {
      if (comments.length) return { comments };
      else return Promise.reject({ status: 404, message: 'No Comments Found' });
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

module.exports = {
  insertCommentM,
  selectCommentsM,
  removeCommentM
};
