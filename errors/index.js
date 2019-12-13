exports.send404Error = (req, res, next) => {
  res.status(404).send({ msg: 'Not Found' });
};

exports.send405Error = (req, res, next) => {
  res.status(405).send({ msg: 'Method Not Allowed' });
};

exports.psqlErrorHandler = (err, req, res, next) => {
  const { code, message } = err;
  if (code) {
    const codeRef = {
      '22P02': {
        status: 400,
        message: 'Invalid Input Syntax'
      },
      '23502': {
        status: 400,
        message: 'Bad Request'
      },
      '42703': {
        status: 400,
        message: 'This Column Does Not Exist'
      },
      '42P01': {
        status: 400,
        message: 'Relation Does Not Exist'
      }
    };
    if (codeRef[code]) {
      res.status(codeRef[code].status).send({ msg: codeRef[code].message });
    } else {
      console.log('UNEXPECTED ERROR:', message);
      res.status(422).send({ msg: message });
    }
  } else {
    next(err);
  }
};

exports.customErrorHandler = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.message });
  } else {
    next(err);
  }
};

exports.send500Error = (err, req, res, next) => {
  console.log('INERNAL SERVER ERROR:', err);
  res.status(500).send({ msg: 'Internal Server Error' });
};
