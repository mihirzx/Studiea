import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
  audio_url: { type: String },           // GCP signed URL (private bucket)
  transcript: { type: String },          // raw transcript from Speech-to-Text
  // Gemini-processed notes as an object: { topics, objectives, examples, homework_hints }.
  // Mixed because the frontend reads structured_notes.topics directly.
  structured_notes: { type: mongoose.Schema.Types.Mixed },
  syllabus_context: { type: String },    // extracted topics and objectives
  recorded_at: { type: Date, default: () => new Date() }
});

export default mongoose.model('Session', sessionSchema);
