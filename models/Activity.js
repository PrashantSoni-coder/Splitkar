const mongoose = require('mongoose');

const ACTIVITY_TYPES = ['added_expense','settled_expense','joined_group','created_group','deleted_expense'];

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  type: {
    type: String,
    enum: ACTIVITY_TYPES,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });


activitySchema.index({ group: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
