const Expense  = require('../models/Expense');
const Group    = require('../models/Group');
const Activity = require('../models/Activity');
const { calculateEqualSplit } = require('../utils/splitCalculator');
const { validationResult } = require('express-validator');

// POST /expenses  (add expense to a group)
exports.postCreateExpense = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect(`/groups/${req.body.groupId}`);
  }
  try {
    const { title, amount, notes, groupId } = req.body;
    const group = await Group.findById(groupId).populate('members', '_id');
    if (!group) { req.flash('error', 'Group not found.'); return res.redirect('/groups'); }
    const isMember = group.members.some(m => m._id.toString() === req.session.user._id.toString());
    if (!isMember) { req.flash('error', 'Access denied.'); return res.redirect('/groups'); }

    const memberIds = group.members.map(m => m._id);
    const splits = calculateEqualSplit(parseFloat(amount), memberIds);

    const expense = await Expense.create({
      title,
      amount: parseFloat(amount),
      paidBy: req.session.user._id,
      group: groupId,
      splits,
      notes,
      createdBy: req.session.user._id
    });

    await Activity.create({
      user: req.session.user._id,
      group: groupId,
      type: 'added_expense',
      description: `${req.session.user.name} added "${title}" (₹${parseFloat(amount).toFixed(2)})`,
      meta: { expenseId: expense._id }
    });

    req.flash('success', 'Expense added!');
    res.redirect(`/groups/${groupId}`);
  } catch (err) { next(err); }
};

// POST /expenses/:id/settle
exports.settleExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('paidBy', 'name');
    if (!expense) { req.flash('error', 'Expense not found.'); return res.redirect('/groups'); }

    const userId = req.session.user._id.toString();
    const split = expense.splits.find(s => s.user.toString() === userId);
    if (!split) { req.flash('error', 'You are not part of this expense.'); return res.redirect(`/groups/${expense.group}`); }
    if (split.settled) { req.flash('error', 'Already settled.'); return res.redirect(`/groups/${expense.group}`); }

    split.settled   = true;
    split.settledAt = new Date();
    await expense.save();

    await Activity.create({
      user: req.session.user._id,
      group: expense.group,
      type: 'settled_expense',
      description: `${req.session.user.name} settled their share of "${expense.title}"`,
      meta: { expenseId: expense._id }
    });

    req.flash('success', 'Share marked as settled!');
    res.redirect(`/groups/${expense.group}`);
  } catch (err) { next(err); }
};

// DELETE /expenses/:id
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) { req.flash('error', 'Expense not found.'); return res.redirect('/groups'); }
    if (expense.createdBy.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Only the creator can delete this expense.');
      return res.redirect(`/groups/${expense.group}`);
    }
    const groupId = expense.group;
    await Activity.create({
      user: req.session.user._id,
      group: groupId,
      type: 'deleted_expense',
      description: `${req.session.user.name} deleted expense "${expense.title}"`
    });
    await expense.deleteOne();
    req.flash('success', 'Expense deleted.');
    res.redirect(`/groups/${groupId}`);
  } catch (err) { next(err); }
};
