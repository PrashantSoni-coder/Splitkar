const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    if (req.accepts('html')) {
      req.flash('error', messages);
      return res.redirect('back');
    }
    return res.status(400).json({ error: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const msg   = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    if (req.accepts('html')) {
      req.flash('error', msg);
      return res.redirect('back');
    }
    return res.status(409).json({ error: msg });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    if (req.accepts('html')) {
      req.flash('error', 'Resource not found.');
      return res.redirect('/dashboard');
    }
    return res.status(404).json({ error: 'Resource not found.' });
  }

  const status = err.status || 500;
  res.status(status).render('error', {
    title:   'Something went wrong',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    layout:  false
  });
};

module.exports = errorHandler;
