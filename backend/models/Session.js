import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
  audio_url: { type: String },           // GCP signed URL (private bucket)
  transcript: { type: String },          // raw transcript from Speech-to-Text
  structured_notes: { type: String },    // Gemini-processed structured notes
  syllabus_context: { type: String },    // extracted topics and objectives
  recorded_at: { type: Date, default: () => new Date() }
});

export default mongoose.model('Session', sessionSchema);
