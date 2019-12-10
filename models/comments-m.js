const connection = require('../db/connection');

const insertCommentM = ({ article_id }, { username, body }) => {
  return connection('comments')
    .insert({ author: username, article_id: article_id, body: body })
    .returning('*')
    .then(([comment]) => {
      return { comment };
    });
};

const selectCommentsM = ({ sort_by = 'created_at', order = 'desc' }) => {
  return connection
    .select()
    .from('comments')
    .orderBy(sort_by, order)
    .returning('*')
    .then(comments => {
      return { comments };
    });
};

const removeCommentM = ({ comment_id }) => {
  return connection('comments')
    .where('comment_id', '=', comment_id)
    .del();
};

module.exports = {
  insertCommentM,
  selectCommentsM,
  removeCommentM
};
