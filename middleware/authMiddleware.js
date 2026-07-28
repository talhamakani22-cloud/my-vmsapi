/**
 * Authentication Middleware
 * Verifies user session and extracts user info
 */

const authMiddleware = (req, res, next) => {
  // Check if user session exists
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Please login first',
    });
  }

  // Attach user info to request object
  req.userId = req.session.user.id || req.session.user._id;
  req.userEmail = req.session.user.email;

  next();
};

module.exports = authMiddleware;
