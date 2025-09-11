const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/user/profile - Get authenticated user's profile information
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    
    // Get user with accounts information
    const userProfile = await User.findByIdWithAccounts(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile could not be retrieved'
      });
    }

    // Remove sensitive information
    const { mot_de_passe, ...profileData } = userProfile;

    res.json({
      message: 'User profile retrieved successfully',
      profile: profileData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve user profile'
    });
  }
});

module.exports = router;
