const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chains.
 * On failure: flashes first error and redirects back.
 */
exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('back');
  }
  next();
};
