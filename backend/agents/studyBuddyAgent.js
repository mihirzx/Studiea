// Agent 4 — Study Buddy (two modes)
import { generateJSON, generateText } from '../utils/gemini.js';
import { buildStudyPlanPrompt, buildStudyBuddyChatPrompt } from '../utils/promptBuilder.js';
import { validateStudyPlan } from '../utils/validateAgentOutput.js';
import StudyPlan from '../models/StudyPlan.js';
import ChatMessage from '../models/ChatMessage.js';
import Submission from '../models/Submission.js';
import StudentProgress from '../models/StudentProgress.js';

/**
 * MODE A — Daily plan generation (triggered by Grader).
 * Step 1: Read submission.weak_areas + student_progress.topic_mastery.
 * Step 2: Gemini with web-search grounding -> { daily_goal, plan_text, resources: [...] }.
 * Step 3: Validate output, save study_plan.
 *
 * @param {{ studentId: string, submissionId: string }} input
 * @returns {Promise<string>} study_plan_id
 */
export const generateDailyPlan = async ({ studentId, submissionId }) => {
  // TODO Step 1: const submission = await Submission.findById(submissionId);
  //              const progress = await StudentProgress.findOne({ student_id: studentId });
  // TODO Step 2: const out = await generateJSON(buildStudyPlanPrompt(weakAreas, topicMastery), { tools: [{ googleSearch: {} }] });
  // TODO Step 3: const plan = validateStudyPlan(out); await StudyPlan.create({ ... });
  void generateJSON; void buildStudyPlanPrompt; void validateStudyPlan; void StudyPlan; void Submission; void StudentProgress;
  throw new Error('Not implemented: generateDailyPlan');
};

/**
 * MODE B — Conversational chat.
 * Step 1: Fetch last 20 ChatMessage docs for the student's active study_plan
 *         (query chat_messages — do not read from study_plans).
 * Step 2: System prompt restricts to STEM + XML-isolates <student_message>.
 *         Save both the student message and the agent response as ChatMessage docs.
 * Step 3: Return response to student.
 *
 * @param {{ studentId: string, message: string }} input
 * @returns {Promise<string>} assistant response
 */
export const chat = async ({ studentId, message }) => {
  // TODO Step 1: const history = await ChatMessage.find({ student_id: studentId }).sort({ timestamp: -1 }).limit(20);
  // TODO Step 2: const reply = await generateText(buildStudyBuddyChatPrompt(message) + history...);
  //              await ChatMessage.create({ student_id: studentId, role: 'user', content: message });
  //              await ChatMessage.create({ student_id: studentId, role: 'assistant', content: reply });
  // TODO Step 3: return reply;
  void generateText; void buildStudyBuddyChatPrompt; void ChatMessage;
  throw new Error('Not implemented: chat');
};
