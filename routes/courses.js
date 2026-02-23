const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protectEndpoint } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      courses: courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      course: course,
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

module.exports = router;
