const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  teacherEvaluation: {
    type: String,
    default: '',
  },
  courseEvaluation: {
    type: String,
    default: '',
  },
  practicalUse: {
    type: String,
    default: '',
  },
  studentRequests: {
    type: String,
    default: '',
  },
  returnAsTeacher: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);