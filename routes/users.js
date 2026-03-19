const express = require('express');
const router = express.Router();
const { protectEndpoint } = require('../middleware/auth');

const SCHOOL_API_BASE = process.env.MZIURI_BACK_URL;

router.get('/me/profile', protectEndpoint, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    const response = await fetch(`${SCHOOL_API_BASE}/me`, {
      headers: { Authorization: authHeader },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: 'Failed to get profile' });
    }

    res.status(200).json({ success: true, user: data });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

module.exports = router;