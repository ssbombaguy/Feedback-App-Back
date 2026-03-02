const mongoose = require('mongoose');

const feedbackEntrySchema  = new mongoose.Schema({
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
  idealSchool: {
    type: String,
    default: '',
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
 
});
 const feedbackSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    unique: true,  
  },
  entries: [feedbackEntrySchema],  
})
module.exports = mongoose.model('Feedback', feedbackSchema);