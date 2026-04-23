const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).render('error', {
    title: 'Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred.' : err.message,
    layout: false
  });
};

module.exports = errorHandler;
