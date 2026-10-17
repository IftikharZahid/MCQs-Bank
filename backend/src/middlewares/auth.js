import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.qb_admin_token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AdminUser.findById(decoded.sub).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or deactivated account' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token' });
  }
};
