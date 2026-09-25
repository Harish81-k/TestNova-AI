const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const BannedUser = require('../models/BannedUser');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "290960187669-jtj6rvhjs6pos6eo19fioo4r7adrmh7h.apps.googleusercontent.com");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Note: Django used username and password, frontend passes username and password
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const isBanned = await BannedUser.findOne({ identifier: username });
    if (isBanned) {
      return res.status(403).json({ error: 'This account has been banned' });
    }

    const user = await User.create({
      username,
      password,
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const isBanned = await BannedUser.findOne({ identifier: username });
    if (isBanned) {
      return res.status(403).json({ error: 'This account has been banned' });
    }

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || "290960187669-jtj6rvhjs6pos6eo19fioo4r7adrmh7h.apps.googleusercontent.com",
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    
    const isBanned = await BannedUser.findOne({ identifier: email });
    if (isBanned) {
      return res.status(403).json({ error: 'This account has been banned' });
    }

    let user = await User.findOne({ email });
    
    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        username: email, // Use email as username for uniqueness
        email: email,
      });
    }
    
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name, email }
    });
  } catch (error) {
    console.error("Google Auth Backend Error:", error);
    res.status(401).json({ error: 'Google Authentication failed' });
  }
};

module.exports = {
  signup,
  login,
  logout,
  googleLogin
};
