import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question_id: { type: String, required: true },
  answer: { type: String } // sanitized student input
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  assignment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  answers: [answerSchema],
  proposed_score: { type: Number }, // 0-100, written immediately by Grader — not visible to student
  score: { type: Number },          // 0-100, committed only after teacher approval
  feedback: { type: String },       // visible to student only after approval
  weak_areas: [{ type: String }],
  alert_approved: { type: Boolean, default: false },
  alert_sent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'flagged', 'pending_approval', 'approved'],
    default: 'pending'
  },
  submitted_at: { type: Date, default: () => new Date() }
});

export default mongoose.model('Submission', submissionSchema);
