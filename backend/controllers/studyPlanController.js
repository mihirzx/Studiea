// Study Plan controller (Agent 4).
// import { generateDailyPlan, chat as studyBuddyChat } from '../agents/studyBuddyAgent.js';

// POST /study-plans/generate — internal secret only (called by Grader).
export const generate = async (req, res) => {
  // TODO: const { student_id, submission_id } = req.body; await generateDailyPlan({ studentId: student_id, submissionId: submission_id });
  res.status(501).json({ error: 'Not implemented: generate' });
};

// GET /study-plans/student/:student_id — student (own) or teacher (PLAN ONLY — never chat).
export const getActivePlan = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: getActivePlan' });
};

// POST /study-plans/chat — student chats with Study Buddy.
export const chat = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: chat' });
};

// GET /study-plans/history/:student_id — teacher, past plans for Hex.
export const history = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: history' });
};

// GET /study-plans/chat/:student_id — student's OWN chat history only (restricted).
export const chatHistory = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: chatHistory' });
};
