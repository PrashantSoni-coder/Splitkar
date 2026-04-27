const Group    = require('../models/Group');
const Expense  = require('../models/Expense');
const Activity = require('../models/Activity');
const User     = require('../models/User');
const { validationResult } = require('express-validator');

// GET /groups
exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.session.user._id })
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 });
    res.render('groups/index', { title: 'My Groups', groups });
  } catch (err) { next(err); }
};

// GET /groups/new
exports.getNewGroup = (req, res) => {
  res.render('groups/new', { title: 'Create Group' });
};

// POST /groups
exports.postCreateGroup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/groups/new');
  }
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      createdBy: req.session.user._id,
      members: [req.session.user._id]
    });
    await Activity.create({
      user: req.session.user._id,
      group: group._id,
      type: 'created_group',
      description: `${req.session.user.name} created the group "${group.name}"`
    });
    req.flash('success', `Group "${group.name}" created!`);
    res.redirect(`/groups/${group._id}`);
  } catch (err) { next(err); }
};

// GET /groups/:id
exports.getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group) { req.flash('error', 'Group not found.'); return res.redirect('/groups'); }
    const isMember = group.members.some(m => m._id.toString() === req.session.user._id.toString());
    if (!isMember) { req.flash('error', 'Access denied.'); return res.redirect('/groups'); }

    const expenses = await Expense.find({ group: group._id })
      .populate('paidBy', 'name')
      .populate('splits.user', 'name')
      .sort({ createdAt: -1 });

    // Build balance summary for current user
    const userId = req.session.user._id.toString();
    let totalOwed = 0, totalOwing = 0;
    expenses.forEach(exp => {
      exp.splits.forEach(split => {
        if (split.settled) return;
        if (exp.paidBy._id.toString() === userId && split.user._id.toString() !== userId)
          totalOwed += split.amount;
        if (split.user._id.toString() === userId && exp.paidBy._id.toString() !== userId)
          totalOwing += split.amount;
      });
    });

    res.render('groups/show', { title: group.name, group, expenses, totalOwed, totalOwing });
  } catch (err) { next(err); }
};

// POST /groups/:id/invite
exports.inviteMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) { req.flash('error', 'Group not found.'); return res.redirect('/groups'); }
    if (group.createdBy.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Only the group creator can invite members.');
      return res.redirect(`/groups/${group._id}`);
    }
    const invitee = await User.findOne({ email: email.toLowerCase().trim() });
    if (!invitee) { req.flash('error', 'No user found with that email.'); return res.redirect(`/groups/${group._id}`); }
    const alreadyMember = group.members.some(m => m.toString() === invitee._id.toString());
    if (alreadyMember) { req.flash('error', 'User is already a member.'); return res.redirect(`/groups/${group._id}`); }

    group.members.push(invitee._id);
    await group.save();
    await Activity.create({
      user: invitee._id,
      group: group._id,
      type: 'joined_group',
      description: `${invitee.name} was added to "${group.name}" by ${req.session.user.name}`
    });
    req.flash('success', `${invitee.name} added to the group!`);
    res.redirect(`/groups/${group._id}`);
  } catch (err) { next(err); }
};

// DELETE /groups/:id  (creator only)
exports.deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) { req.flash('error', 'Group not found.'); return res.redirect('/groups'); }
    if (group.createdBy.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Only the creator can delete this group.');
      return res.redirect(`/groups/${group._id}`);
    }
    await Expense.deleteMany({ group: group._id });
    await Activity.deleteMany({ group: group._id });
    await group.deleteOne();
    req.flash('success', 'Group deleted.');
    res.redirect('/groups');
  } catch (err) { next(err); }
};
