import mongoose from 'mongoose';

const scoreHistorySchema = new mongoose.Schema({
  score: { type: Number },
  assignment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  date: { type: Date, default: () => new Date() }
}, { _id: false });

const topicMasterySchema = new mongoose.Schema({
  topic: { type: String },
  mastery_score: { type: Number } // 0-100
}, { _id: false });

const studentProgressSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true, index: true },
  score_history: [scoreHistorySchema], // append-only — feeds Hex graph
  topic_mastery: [topicMasterySchema], // updated by Grader after each submission
  trend: { type: String, enum: ['improving', 'declining', 'stable'], default: 'stable' },
  updated_at: { type: Date, default: () => new Date() }
});

export default mongoose.model('StudentProgress', studentProgressSchema);
