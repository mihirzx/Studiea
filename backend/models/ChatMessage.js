import mongoose from 'mongoose';

// Stored separately from study_plans so teacher access to plans does not
// automatically expose student conversations.
const chatMessageSchema = new mongoose.Schema({
  study_plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', index: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  // Which Study Buddy mode produced this turn, and the assignment it was scoped to (if any).
  mode: { type: String, enum: ['learn', 'homework'], default: 'learn' },
  assignment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  timestamp: { type: Date, default: () => new Date() }
});

export default mongoose.model('ChatMessage', chatMessageSchema);
