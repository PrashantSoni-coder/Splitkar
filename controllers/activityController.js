const Activity = require('../models/Activity');
const Group    = require('../models/Group');

// GET /activity
exports.getActivity = async (req, res, next) => {
  try {
    const userId  = req.session.user._id;
    const page    = parseInt(req.query.page) || 1;
    const limit   = 10;
    const skip    = (page - 1) * limit;
    const groupId = req.query.group || null;

    // Only show activity from groups the user belongs to
    const userGroups = await Group.find({ members: userId }, '_id name');
    const groupIds   = userGroups.map(g => g._id);

    const filter = { group: { $in: groupIds } };
    if (groupId && groupIds.some(id => id.toString() === groupId)) {
      filter.group = groupId;
    }

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('user',  'name')
        .populate('group', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter)
    ]);

    const totalPages  = Math.ceil(total / limit);
    const activeGroup = groupId
      ? userGroups.find(g => g._id.toString() === groupId)
      : null;

    res.render('activity/index', {
      title:       'Activity',
      activities,
      userGroups,
      activeGroup,
      currentPage: page,
      totalPages,
      groupId:     groupId || ''
    });
  } catch (err) { next(err); }
};
