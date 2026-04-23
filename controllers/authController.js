const User = require('../models/User');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

exports.getRegister = (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res) => {
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
        await sendEmail({
            to: user.email,
            subject: 'Welcome to SplitKar!',
            html: `<h2>Hi ${user.name},</h2><p>Welcome to SplitKar! Start splitting expenses with your friends and groups.</p>`
        });
        req.flash('success', `Welcome, ${user.name}!`);
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
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
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

exports.getDashboard = (req, res) => {
    res.render('dashboard/index', { title: 'Dashboard' });
};
