exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.flash('error', 'Please log in to continue.');
  res.redirect('/login');
};

exports.isGuest = (req, res, next) => {
  if (!req.session || !req.session.user) return next();
  res.redirect('/dashboard');
};
