const rateLimit = require('express-rate-limit');

exports.authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              20,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler: (req, res, next) => {
    req.flash('error', 'Too many attempts. Please try again after 15 minutes.');
    res.redirect('back');
  }
});

exports.globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max:      120,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (req, res) => {
    res.status(429).render('error', {
      title:   'Too Many Requests',
      message: 'You are sending too many requests. Please slow down.',
      layout:  false
    });
  }
});
