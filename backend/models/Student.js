import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  password: { type: String, required: true, select: false }, // bcrypt hashed
  overall_score: { type: Number, default: 0 }, // rolling average, updated by Grader
  created_at: { type: Date, default: () => new Date() }
});

export default mongoose.model('Student', studentSchema);
