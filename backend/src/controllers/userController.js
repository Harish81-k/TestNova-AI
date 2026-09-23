const User = require('../models/User');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.location = req.body.location || user.location;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      
      console.log('Received profilePic length:', req.body.profilePic ? req.body.profilePic.length : 0);
      user.profilePic = req.body.profilePic !== undefined ? req.body.profilePic : user.profilePic;
      
      // We only allow plan updates from admin APIs typically, but for now we won't let users update planType here.
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        location: updatedUser.location,
        bio: updatedUser.bio,
        profilePic: updatedUser.profilePic,
        planType: updatedUser.planType,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile };
