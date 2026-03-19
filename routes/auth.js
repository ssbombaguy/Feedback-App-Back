const express = require('express');
const router = express.Router();

const SCHOOL_API_BASE = process.env.MZIURI_BACK_URL;

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const response = await fetch(`${SCHOOL_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Login failed' });
    }

    res.status(200).json({
      success: true,
      token: data.token,
      user: data.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const response = await fetch(`${SCHOOL_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    res.status(200).json({ success: true, user: data });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify token' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    await fetch(`${SCHOOL_API_BASE}/logout`, {
      method: 'POST',
      headers: { Authorization: authHeader },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;