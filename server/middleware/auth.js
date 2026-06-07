const Session = require('../models/admin/Session');
const User = require('../models/admin/User');
const Role = require('../models/admin/Role');

const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const session = await Session.findOne({ token });
    if (!session) {
      return res.status(401).json({ success: false, error: 'Invalid session.' });
    }

    if (new Date() > session.expiresAt) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    }

    const user = await User.findById(session.user);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found.' });
    }

    const role = await Role.findById(user.role);
    if (!role || role.name !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
    }

    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: role.name
    };
    req.session = session;

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { protectAdmin };
