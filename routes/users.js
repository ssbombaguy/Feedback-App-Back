const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protectEndpoint } = require('../middleware/auth');

router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('courses.active')
      .populate('courses.passed');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
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
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.get('/id/:userId', protectEndpoint, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(userId)
      .populate('courses.active')
      .populate('courses.passed');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user data' });
  }
});

router.get('/me/profile', protectEndpoint, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('courses.active')
      .populate('courses.passed');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

router.put('/me', protectEndpoint, async (req, res) => {
  try {
    const { name, lastname, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        lastname,
        email: email?.toLowerCase(),
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        privateNumber: user.privateNumber,
        profilePicture: user.profilePicture,
        town: user.town,
        grade: user.grade,
        courses: user.courses,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

module.exports = router;