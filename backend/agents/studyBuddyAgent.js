// Agent 4 — Study Buddy (two modes)
import { generateJSON, generateText } from '../utils/gemini.js';
import { buildStudyPlanPrompt, buildStudyBuddyChatPrompt } from '../utils/promptBuilder.js';
import { validateStudyPlan } from '../utils/validateAgentOutput.js';
import StudyPlan from '../models/StudyPlan.js';
import ChatMessage from '../models/ChatMessage.js';
import Submission from '../models/Submission.js';
import StudentProgress from '../models/StudentProgress.js';

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * MODE A — Daily plan generation (triggered by Grader via internal endpoint).
 *
 * @param {{ studentId: string, submissionId: string }} input
 * @returns {Promise<object>} the saved StudyPlan
 */
export const generateDailyPlan = async ({ studentId, submissionId }) => {
  const submission = await Submission.findById(submissionId);
  const weakAreas = submission?.weak_areas || [];
  const progress = await StudentProgress.findOne({ student_id: studentId });
  const topicMastery = progress?.topic_mastery || [];

  const raw = await generateJSON(
    buildStudyPlanPrompt(weakAreas.join(', '), JSON.stringify(topicMastery))
  );
  const { daily_goal, plan_text, resources } = validateStudyPlan(raw);

  // One active plan per student per day — replace any existing one for today.
  await StudyPlan.deleteMany({ student_id: studentId, valid_until: { $gte: new Date() } });
  const plan = await StudyPlan.create({
    student_id: studentId,
    submission_id: submissionId,
    daily_goal,
    plan_text,
    weak_areas: weakAreas,
    resources,
    valid_until: endOfToday()
  });
  return plan;
};

/**
 * MODE B — Conversational chat.
 *
 * @param {{ studentId: string, message: string }} input
 * @returns {Promise<string>} the assistant reply
 */
export const chat = async ({ studentId, message }) => {
  // Step 1: last 20 messages (chronological) for short-term context.
  const recent = await ChatMessage.find({ student_id: studentId }).sort({ timestamp: -1 }).limit(20);
  const history = recent
    .reverse()
    .map((m) => `${m.role === 'user' ? 'Student' : 'Study Buddy'}: ${m.content}`)
    .join('\n');

  // Step 2: build the STEM-restricted, XML-isolated prompt and generate a reply.
  const prompt = `${history ? `Conversation so far:\n${history}\n\n` : ''}${buildStudyBuddyChatPrompt(message)}`;
  const reply = (await generateText(prompt)).trim();

  // Persist both turns.
  await ChatMessage.create({ student_id: studentId, role: 'user', content: message });
  await ChatMessage.create({ student_id: studentId, role: 'assistant', content: reply });

  return reply;
};
