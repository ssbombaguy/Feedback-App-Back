const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log(`http://192.168.1.223:${PORT}`);
  console.log(`========================================`);
  console.log(`API Base URL: http://192.168.1.223:${PORT}/api`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/auth/verify-token`);
  console.log(`  GET    /api/users/:email`);
  console.log(`  GET    /api/users/id/:userId (protected)`);
  console.log(`  GET    /api/users/me/profile (protected)`);
  console.log(`  POST   /api/feedback (protected)`);
  console.log(`  GET    /api/feedback/user/:userId (protected)`);
  console.log(`  GET    /api/feedback/course/:courseName`);
  console.log(`  GET    /api/courses`);
  console.log(`  GET    /api/courses/:courseId`);
  console.log(`========================================\n`);
});