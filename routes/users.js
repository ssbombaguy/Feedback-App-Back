const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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
      courses: user.courses || { active: null, passed: [] },
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});



module.exports = router;
