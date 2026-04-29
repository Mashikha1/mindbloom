// ============================================
//  middleware/auth.js
//  Protects routes — checks if user is logged in
// ============================================

// HOW JWT AUTH WORKS:
// 1. User logs in → server creates a "token" (like a wristband)
// 2. Frontend stores the token
// 3. Every request sends the token in the header
// 4. This middleware checks if the token is valid
// 5. If valid → allow the request. If not → block it.

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // 1. Get token from the Authorization header
    // Header format: "Authorization: Bearer eyJhbG..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized. Please log in.' });
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    // 2. Verify the token is valid and not expired
    // jwt.verify() throws an error if invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user this token belongs to
    // We stored the user's ID inside the token when we created it
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    // 4. Attach user to request object
    // Now any route using this middleware can access req.user
    req.user = user;

    // 5. Move on to the actual route handler
    next();

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    res.status(500).json({ error: 'Auth error: ' + err.message });
  }
};

module.exports = { protect };
