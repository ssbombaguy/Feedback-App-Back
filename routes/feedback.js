const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { protectEndpoint } = require('../middleware/auth');

router.post('/', protectEndpoint, async (req, res) => {
  try {
    const { 
      userId, 
      courseName, 
      courseEvaluation, 
      teacherEvaluation,
      practicalUse,
      studentRequests,
      returnAsTeacher,
      idealSchool,
    } = req.body;

    if (userId && userId !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Cannot submit feedback for another user',
      });
    }

    if (!userId || !courseName || !courseEvaluation || !teacherEvaluation || !practicalUse || !studentRequests || !idealSchool) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingFeedback = await Feedback.findOne({
      courseName,
      'entries.userId': userId,
    });

    if (existingFeedback) {
      return res.status(409).json({
        error: 'You have already submitted feedback for this course',
      });
    }

    await Feedback.findOneAndUpdate(
      { courseName },
      {
        $push: {
          entries: {
            userId,
            courseEvaluation,
            teacherEvaluation,
            practicalUse,
            studentRequests,
            idealSchool,
            returnAsTeacher: returnAsTeacher || false,
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

router.get('/user/:userId', protectEndpoint, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Cannot access other users feedback',
      });
    }

    const feedbackDocs = await Feedback.find({
      'entries.userId': userId,
    });

    const userFeedback = feedbackDocs.map(doc => {
      const entry = doc.entries.find(e => e.userId.toString() === userId)
      return {
        courseName: doc.courseName,
        ...entry.toObject(),
      }
    })

    res.status(200).json({
      success: true,
      feedback: userFeedback,
      count: userFeedback.length,
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

router.get('/course/:courseName', async (req, res) => {
  try {
    const { courseName } = req.params;

    const feedbackDoc = await Feedback.findOne({ courseName })
      .populate('entries.userId', 'name lastname email')

    if (!feedbackDoc) {
      return res.status(200).json({
        success: true,
        course: courseName,
        feedback: [],
        count: 0,
      });
    }

    res.status(200).json({
      success: true,
      course: courseName,
      feedback: feedbackDoc.entries,
      count: feedbackDoc.entries.length,
    });
  } catch (error) {
    console.error('Get course feedback error:', error);
    res.status(500).json({ error: 'Failed to get course feedback' });
  }
});

module.exports = router;
