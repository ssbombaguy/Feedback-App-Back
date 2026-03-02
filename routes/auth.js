const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('courses.active')
      .populate('courses.passed');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      privateNumber: user.privateNumber,
      profilePicture: user.profilePicture,
      town: user.town,
      grade: user.grade,
      courses: user.courses || { active: [], passed: [] },
      isAdmin: user.isAdmin,
    };

    res.status(200).json({ success: true, user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/verify-token', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('courses.active')
      .populate('courses.passed');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      privateNumber: user.privateNumber,
      profilePicture: user.profilePicture,
      town: user.town,
      grade: user.grade,
      courses: user.courses || { active: [], passed: [] },
    };

    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify token' });
  }
});

module.exports = router;