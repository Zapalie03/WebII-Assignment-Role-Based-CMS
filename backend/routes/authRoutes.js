const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   GET /api/auth
// @desc    Get auth routes info
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication endpoints',
    endpoints: {
      register: 'POST /register',
      login: 'POST /login',
      refreshToken: 'POST /refresh-token',
      logout: 'POST /logout (requires token)',
      me: 'GET /me (requires token)'
    }
  });
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/refresh-token
// @desc    Get new access token using refresh token
// @access  Public
router.post('/refresh-token', authController.refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Private
router.post('/logout', verifyToken, authController.logout);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;