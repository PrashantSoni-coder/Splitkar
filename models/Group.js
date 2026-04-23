const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [60, 'Group name cannot exceed 60 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

groupSchema.pre('save', function (next) {
  const creatorId = this.createdBy.toString();
  const isMember = this.members.some(m => m.toString() === creatorId);
  if (!isMember) this.members.push(this.createdBy);
  next();
});

module.exports = mongoose.model('Group', groupSchema);
