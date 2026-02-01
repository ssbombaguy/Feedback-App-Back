const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');

router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      courseName, 
      courseEvaluation, 
      teacherEvaluation,
      practicalUse,
      studentRequests,
      returnAsTeacher 
    } = req.body;

    if (!userId || !courseName || !courseEvaluation || !teacherEvaluation || !practicalUse || !studentRequests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const feedbackExists = await Feedback.findOne({
      userId,
      courseName,
    });

    if (feedbackExists) {
      return res.status(409).json({
        error: 'You have already submitted feedback for this course',
      });
    }

    const newFeedback = new Feedback({
      userId,
      courseName,
      courseEvaluation,
      teacherEvaluation,
      practicalUse,
      studentRequests,
      returnAsTeacher: returnAsTeacher || false,
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const feedbackList = await Feedback.find({ userId }).sort({
      submittedAt: -1,
    });

    res.status(200).json({
      feedback: feedbackList,
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

module.exports = router;
