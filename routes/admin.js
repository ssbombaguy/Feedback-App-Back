const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { verifyAdmin } = require('../middleware/adminAuth');


router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    
    const feedbackDocs = await Feedback.find();
    let totalFeedbacks = 0;
    feedbackDocs.forEach(doc => {
      totalFeedbacks += doc.entries.length;
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalCourses,
        totalUsers,
        totalAdmins,
        totalFeedbacks,
        adminName: req.adminUser.name,
        adminEmail: req.adminUser.email,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});


router.get('/courses', verifyAdmin, async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      courses: courses,
      totalCourses: courses.length,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});


router.get('/courses/:courseName/feedbacks', verifyAdmin, async (req, res) => {
  try {
    const { courseName } = req.params;

    const feedback = await Feedback.findOne({ courseName })
      .populate('entries.userId', 'name lastname email phone town grade');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'No feedbacks found for this course',
      });
    }

    res.status(200).json({
      success: true,
      courseName: feedback.courseName,
      totalFeedbacks: feedback.entries.length,
      feedbacks: feedback.entries,
    });
  } catch (error) {
    console.error('Get course feedbacks error:', error);
    res.status(500).json({ error: 'Failed to get course feedbacks' });
  }
});


router.get('/feedbacks', verifyAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('entries.userId', 'name lastname email phone town grade');

    let allFeedbacks = [];
    feedbacks.forEach(doc => {
      doc.entries.forEach(entry => {
        allFeedbacks.push({
          courseName: doc.courseName,
          ...entry.toObject(),
        });
      });
    });

    res.status(200).json({
      success: true,
      totalFeedbacks: allFeedbacks.length,
      feedbacks: allFeedbacks,
    });
  } catch (error) {
    console.error('Get all feedbacks error:', error);
    res.status(500).json({ error: 'Failed to get feedbacks' });
  }
});


router.get('/courses/:courseName/feedbacks/:feedbackId', verifyAdmin, async (req, res) => {
  try {
    const { courseName, feedbackId } = req.params;

    const feedback = await Feedback.findOne({ courseName })
      .populate('entries.userId', 'name lastname email phone town grade');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    const feedbackEntry = feedback.entries.find(entry => entry._id.toString() === feedbackId);

    if (!feedbackEntry) {
      return res.status(404).json({
        success: false,
        error: 'Feedback entry not found',
      });
    }

    res.status(200).json({
      success: true,
      courseName: feedback.courseName,
      feedback: feedbackEntry,
    });
  } catch (error) {
    console.error('Get feedback entry error:', error);
    res.status(500).json({ error: 'Failed to get feedback entry' });
  }
});

router.get('/courses/:courseName/statistics', verifyAdmin, async (req, res) => {
  try {
    const { courseName } = req.params;

    const feedback = await Feedback.findOne({ courseName });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'No feedbacks found for this course',
      });
    }

    const entries = feedback.entries;
    let returnAsTeacherCount = 0;
    const totalFeedbacks = entries.length;

    entries.forEach(entry => {
      if (entry.returnAsTeacher) {
        returnAsTeacherCount++;
      }
    });

    res.status(200).json({
      success: true,
      courseName: feedback.courseName,
      statistics: {
        totalFeedbacks: totalFeedbacks,
        returnAsTeacherCount: returnAsTeacherCount,
        returnAsTeacherPercentage: totalFeedbacks > 0 ? ((returnAsTeacherCount / totalFeedbacks) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error('Get course statistics error:', error);
    res.status(500).json({ error: 'Failed to get course statistics' });
  }
});


router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select('-password')
      .populate('courses.active')
      .populate('courses.passed')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      users: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});


router.get('/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('courses.active')
      .populate('courses.passed');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const feedbacks = await Feedback.find({
      'entries.userId': userId,
    });

    const userFeedbacks = feedbacks.map(doc => ({
      courseName: doc.courseName,
      entries: doc.entries.filter(entry => entry.userId.toString() === userId),
    }));

    res.status(200).json({
      success: true,
      user: user,
      feedbacks: userFeedbacks,
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

module.exports = router;
