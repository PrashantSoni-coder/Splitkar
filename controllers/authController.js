const User     = require('../models/User');
const Group    = require('../models/Group');
const Expense  = require('../models/Expense');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

exports.getRegister = (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/register');
  }
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/register');
    }
    const user = await User.create({ name, email, password });
    req.session.user = { _id: user._id, name: user.name, email: user.email };
    sendEmail.welcome(user).catch(() => {});
    req.flash('success', `Welcome, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) { next(err); }
};

exports.getLogin = (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Login' });
};

exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/login');
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.user = { _id: user._id, name: user.name, email: user.email };
      req.flash('success', `Welcome back, ${user.name}!`);
      res.redirect('/dashboard');
    });
  } catch (err) { next(err); }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const groups = await Group.find({ members: userId })
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    const expenses = await Expense.find({
      group: { $in: groups.map(g => g._id) }
    }).populate('paidBy', '_id');

    let totalOwed = 0, totalOwing = 0;
    expenses.forEach(exp => {
      exp.splits.forEach(split => {
        if (split.settled) return;
        if (exp.paidBy._id.toString() === userId.toString() && split.user.toString() !== userId.toString())
          totalOwed += split.amount;
        if (split.user.toString() === userId.toString() && exp.paidBy._id.toString() !== userId.toString())
          totalOwing += split.amount;
      });
    });

    res.render('dashboard/index', {
      title: 'Dashboard', groups,
      totalOwed:  totalOwed.toFixed(2),
      totalOwing: totalOwing.toFixed(2)
    });
  } catch (err) { next(err); }
};
