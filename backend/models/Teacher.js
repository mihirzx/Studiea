import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  password: { type: String, required: true, select: false }, // bcrypt hashed, never returned by default
  subject: { type: String },
  threshold_pct: { type: Number, default: 70 }, // alert fires below this score
  created_at: { type: Date, default: () => new Date() }
});

export default mongoose.model('Teacher', teacherSchema);
