exports.formatDates = articleData => {
  return articleData.map(({ ...articleDataCopy }) => {
    articleDataCopy.created_at = new Date(articleDataCopy.created_at);
    return articleDataCopy;
  });
};

exports.makeRefObj = list => {
  return Object.fromEntries(
    list.map(article => [article.title, article.article_id])
  );
};

exports.formatComments = (comments, articleRef) => {
  const newComments = this.formatDates(comments);
  return newComments.map(({ created_by, belongs_to, ...restOfKeys }) => {
    return {
      author: created_by,
      article_id: articleRef[belongs_to],
      ...restOfKeys
    };
  });
};
