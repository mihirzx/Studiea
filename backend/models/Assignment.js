import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question_id: { type: String, required: true },
  prompt: { type: String, required: true },
  // select: false — never returned by default. Fetch in graderAgent.js only:
  //   Assignment.findById(id).select('+questions.expected_answer')
  expected_answer: { type: String, select: false },
  points: { type: Number, default: 0 }
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
  title: { type: String, required: true },
  subject: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questions: [questionSchema],
  due_date: { type: Date },
  created_at: { type: Date, default: () => new Date() }
});

export default mongoose.model('Assignment', assignmentSchema);
