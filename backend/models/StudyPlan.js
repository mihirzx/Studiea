import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String },
  url: { type: String },
  description: { type: String }
}, { _id: false });

const studyPlanSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }, // what triggered this plan
  daily_goal: { type: String },
  weak_areas: [{ type: String }],   // copied from submission
  resources: [resourceSchema],      // pulled by Gemini web search
  plan_text: { type: String },      // full Study Buddy generated plan
  // chat_history lives in the ChatMessage collection, NOT here
  generated_at: { type: Date, default: () => new Date() },
  valid_until: { type: Date }       // expires at midnight — regenerated daily
});

export default mongoose.model('StudyPlan', studyPlanSchema);
