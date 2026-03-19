const express = require('express');
const router = express.Router();

const SCHOOL_API_BASE = process.env.MZIURI_BACK_URL;

const getToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

// Public - no token needed
router.get('/', async (req, res) => {
  try {
    const response = await fetch(`${SCHOOL_API_BASE}/courses`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to get courses' });
    }

    res.status(200).json({ success: true, courses: data });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Protected - token required
router.get('/enrolled', async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const response = await fetch(`${SCHOOL_API_BASE}/user/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to get enrolled courses' });
    }

    res.status(200).json({ success: true, enrolled_courses: data.enrolled_courses });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ error: 'Failed to get enrolled courses' });
  }
});

router.get('/:courseId', async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { courseId } = req.params;

    const response = await fetch(`${SCHOOL_API_BASE}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Course not found' });
    }

    res.status(200).json({ success: true, course: data });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

module.exports = router;