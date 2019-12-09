exports.formatDates = list => {
  return list.map(({ ...newObj }) => {
    newObj.created_at = new Date(newObj.created_at);
    return newObj;
  });
};

exports.makeRefObj = list => {
  return Object.fromEntries(list.map(x => [x.title, x.article_id]));
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
