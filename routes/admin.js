const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const jwt = require('jsonwebtoken');
const { verifyAdmin } = require('../middleware/adminAuth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Received:', email, password)
    console.log('Expected:', process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { email, isAdmin: true },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const feedbackDocs = await Feedback.find();

    let totalFeedbacks = 0;
    const coursesSummary = feedbackDocs.map(doc => {
      totalFeedbacks += doc.entries.length;
      return {
        courseName: doc.courseName,
        totalFeedbacks: doc.entries.length,
      };
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalCourses: feedbackDocs.length,
        totalFeedbacks,
        courses: coursesSummary,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

router.get('/courses', verifyAdmin, async (req, res) => {
  try {
    const feedbackDocs = await Feedback.find().select('courseName entries');

    const courses = feedbackDocs.map(doc => ({
      courseName: doc.courseName,
      totalFeedbacks: doc.entries.length,
    }));

    res.status(200).json({ success: true, totalCourses: courses.length, courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

router.get('/courses/:courseName/feedbacks', verifyAdmin, async (req, res) => {
  try {
    const { courseName } = req.params;
    const feedbackDoc = await Feedback.findOne({ courseName });

    if (!feedbackDoc) {
      return res.status(404).json({ success: false, error: 'No feedbacks found for this course' });
    }

    res.status(200).json({
      success: true,
      courseName: feedbackDoc.courseName,
      totalFeedbacks: feedbackDoc.entries.length,
      feedbacks: feedbackDoc.entries,
    });
  } catch (error) {
    console.error('Get course feedbacks error:', error);
    res.status(500).json({ error: 'Failed to get course feedbacks' });
  }
});

router.get('/courses/:courseName/feedbacks/:feedbackId', verifyAdmin, async (req, res) => {
  try {
    const { courseName, feedbackId } = req.params;
    const feedbackDoc = await Feedback.findOne({ courseName });

    if (!feedbackDoc) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const entry = feedbackDoc.entries.find(e => e._id.toString() === feedbackId);

    if (!entry) {
      return res.status(404).json({ success: false, error: 'Feedback entry not found' });
    }

    res.status(200).json({ success: true, courseName, feedback: entry });
  } catch (error) {
    console.error('Get feedback entry error:', error);
    res.status(500).json({ error: 'Failed to get feedback entry' });
  }
});

router.get('/courses/:courseName/statistics', verifyAdmin, async (req, res) => {
  try {
    const { courseName } = req.params;
    const feedbackDoc = await Feedback.findOne({ courseName });

    if (!feedbackDoc) {
      return res.status(404).json({ success: false, error: 'No feedbacks found for this course' });
    }

    const entries = feedbackDoc.entries;
    const totalFeedbacks = entries.length;
    const returnAsTeacherCount = entries.filter(e => e.returnAsTeacher).length;
    const anonymousCount = entries.filter(e => e.isAnonymous).length;

    res.status(200).json({
      success: true,
      courseName,
      statistics: {
        totalFeedbacks,
        returnAsTeacherCount,
        returnAsTeacherPercentage: totalFeedbacks > 0 ? ((returnAsTeacherCount / totalFeedbacks) * 100).toFixed(2) : 0,
        anonymousCount,
        anonymousPercentage: totalFeedbacks > 0 ? ((anonymousCount / totalFeedbacks) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error('Get course statistics error:', error);
    res.status(500).json({ error: 'Failed to get course statistics' });
  }
});

router.get('/feedbacks', verifyAdmin, async (req, res) => {
  try {
    const feedbackDocs = await Feedback.find();
    const allFeedbacks = [];

    feedbackDocs.forEach(doc => {
      doc.entries.forEach(entry => {
        allFeedbacks.push({ courseName: doc.courseName, ...entry.toObject() });
      });
    });

    res.status(200).json({ success: true, totalFeedbacks: allFeedbacks.length, feedbacks: allFeedbacks });
  } catch (error) {
    console.error('Get all feedbacks error:', error);
    res.status(500).json({ error: 'Failed to get feedbacks' });
  }
});

module.exports = router;