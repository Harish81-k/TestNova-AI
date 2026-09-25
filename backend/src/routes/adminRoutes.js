const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BannedUser = require('../models/BannedUser');
const jwt = require('jsonwebtoken');

// Hardcoded Admin Credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'adminpassword';

// @route   POST /api/admin/login
// @desc    Auth admin & get token
// @access  Public
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '30d',
    });
    res.json({ token, username });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
});

// Middleware to protect admin routes
const adminProtect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      if (decoded.role === 'admin') {
        next();
      } else {
        res.status(401).json({ message: 'Not authorized as admin' });
      }
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', adminProtect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/admin/users/:id/plan
// @desc    Update user plan
// @access  Private/Admin
router.put('/users/:id/plan', adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.planType = req.body.planType || user.planType;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user and ban their email/username
// @access  Private/Admin
router.delete('/users/:id', adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Add email and username to banned list
      if (user.email) {
        await BannedUser.findOneAndUpdate(
          { identifier: user.email },
          { identifier: user.email },
          { upsert: true, new: true }
        );
      }
      if (user.username) {
        await BannedUser.findOneAndUpdate(
          { identifier: user.username },
          { identifier: user.username },
          { upsert: true, new: true }
        );
      }

      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User deleted and banned successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
