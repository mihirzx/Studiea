// Study Plan controller (Agent 4).
import StudyPlan from '../models/StudyPlan.js';
import ChatMessage from '../models/ChatMessage.js';
import Student from '../models/Student.js';
import Assignment from '../models/Assignment.js';
import { generateDailyPlan, chat as studyBuddyChat } from '../agents/studyBuddyAgent.js';

// POST /study-plans/generate — internal secret only (called by the Grader).
export const generate = async (req, res, next) => {
  try {
    const { student_id, submission_id } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id is required' });
    const plan = await generateDailyPlan({ studentId: student_id, submissionId: submission_id });
    return res.status(201).json({ _id: String(plan._id) });
  } catch (err) {
    next(err);
  }
};

// GET /study-plans/student/:student_id — student (own) or teacher (PLAN ONLY — never chat).
export const getActivePlan = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    if (req.user.role === 'student' && req.user.id !== student_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role === 'teacher') {
      const student = await Student.findById(student_id).catch(() => null);
      if (!student || req.user.id !== String(student.teacher_id)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    const plan = await StudyPlan.findOne({ student_id, valid_until: { $gte: new Date() } }).sort({ generated_at: -1 });
    if (!plan) return res.json(null);
    // Plan data only — chat lives in a separate, student-restricted route.
    return res.json({
      _id: String(plan._id),
      daily_goal: plan.daily_goal,
      plan_text: plan.plan_text,
      weak_areas: plan.weak_areas,
      resources: plan.resources,
      generated_at: plan.generated_at
    });
  } catch (err) {
    next(err);
  }
};

// POST /study-plans/chat — student chats with Study Buddy.
// Body: { message, mode?: 'learn'|'homework', assignment_id? }.
export const chat = async (req, res, next) => {
  try {
    const message = (req.body?.message || '').toString();
    if (!message.trim()) return res.status(400).json({ error: 'message is required' });

    const mode = req.body?.mode === 'homework' ? 'homework' : 'learn';

    // If scoped to an assignment, it must belong to the student's own teacher.
    let assignmentId;
    if (req.body?.assignment_id) {
      const assignment = await Assignment.findById(req.body.assignment_id).catch(() => null);
      const student = await Student.findById(req.user.id);
      if (!assignment || !student || String(assignment.teacher_id) !== String(student.teacher_id)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      assignmentId = String(assignment._id);
    }

    const reply = await studyBuddyChat({ studentId: req.user.id, message, mode, assignmentId });
    return res.json({ message: reply, mode });
  } catch (err) {
    next(err);
  }
};

// GET /study-plans/history/:student_id — teacher, past plans for Hex.
export const history = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const student = await Student.findById(student_id).catch(() => null);
    if (!student || req.user.id !== String(student.teacher_id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const plans = await StudyPlan.find({ student_id }).sort({ generated_at: -1 }).limit(30);
    return res.json(plans);
  } catch (err) {
    next(err);
  }
};

// GET /study-plans/chat/:student_id — student's OWN chat history only (restricted).
export const chatHistory = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    if (req.user.id !== student_id) return res.status(403).json({ error: 'Forbidden' });
    const messages = await ChatMessage.find({ student_id }).sort({ timestamp: 1 }).limit(200);
    return res.json(messages.map((m) => ({ role: m.role, content: m.content })));
  } catch (err) {
    next(err);
  }
};
