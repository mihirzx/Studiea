// Assignment controller (Agent 2). expected_answer is select:false, so it is only
// ever returned to the owning teacher (explicitly selected), never to students.
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Student from '../models/Student.js';
import { runHwGenerator } from '../agents/hwGeneratorAgent.js';

// Public (student-safe) view of an assignment — no expected_answer.
const studentView = (a) => ({
  _id: String(a._id),
  title: a.title,
  subject: a.subject,
  difficulty: a.difficulty,
  due_date: a.due_date,
  questions: a.questions.map((q) => ({ question_id: q.question_id, prompt: q.prompt, points: q.points }))
});

// POST /assignments/generate — trigger HW generation from session_id.
export const generate = async (req, res, next) => {
  try {
    const { session_id, teaching_directive } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });
    const assignment = await runHwGenerator({
      sessionId: session_id,
      teacherId: req.user.id,
      teachingDirective: teaching_directive
    });
    return res.status(201).json({ _id: String(assignment._id) });
  } catch (err) {
    next(err);
  }
};

// GET /assignments/:id — teacher owner (full, incl. expected_answer) or assigned student (safe view).
export const getById = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher') {
      const a = await Assignment.findById(req.params.id).select('+questions.expected_answer').catch(() => null);
      if (!a) return res.status(404).json({ error: 'Not found' });
      if (req.user.id !== String(a.teacher_id)) return res.status(403).json({ error: 'Forbidden' });
      return res.json(a);
    }
    // student: only assignments belonging to their teacher, and never expected_answer.
    const a = await Assignment.findById(req.params.id).catch(() => null);
    if (!a) return res.status(404).json({ error: 'Not found' });
    const student = await Student.findById(req.user.id);
    if (!student || String(student.teacher_id) !== String(a.teacher_id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json(studentView(a));
  } catch (err) {
    next(err);
  }
};

// GET /assignments/student/:student_id — all assignments for the student's teacher, with submission status.
export const listByStudent = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    if (req.user.id !== student_id) return res.status(403).json({ error: 'Forbidden' });
    const student = await Student.findById(student_id);
    if (!student) return res.status(404).json({ error: 'Not found' });

    const assignments = await Assignment.find({ teacher_id: student.teacher_id }).sort({ created_at: -1 });
    const subs = await Submission.find({ student_id }).select('assignment_id status');
    const statusByAssignment = new Map(subs.map((s) => [String(s.assignment_id), s.status]));

    return res.json(assignments.map((a) => ({
      _id: String(a._id),
      title: a.title,
      subject: a.subject,
      difficulty: a.difficulty,
      due_date: a.due_date,
      status: statusByAssignment.get(String(a._id)) || null
    })));
  } catch (err) {
    next(err);
  }
};

// GET /assignments/teacher/:teacher_id — all assignments by the teacher (+ a status hint for the table).
export const listByTeacher = async (req, res, next) => {
  try {
    const { teacher_id } = req.params;
    if (req.user.id !== teacher_id) return res.status(403).json({ error: 'Forbidden' });
    const assignments = await Assignment.find({ teacher_id }).sort({ created_at: -1 });
    return res.json(assignments.map((a) => ({
      _id: String(a._id),
      title: a.title,
      subject: a.subject,
      difficulty: a.difficulty,
      due_date: a.due_date
    })));
  } catch (err) {
    next(err);
  }
};

// PATCH /assignments/:id — teacher edits generated assignment (questions, title, subject, difficulty, due_date).
export const update = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id).catch(() => null);
    if (!a) return res.status(404).json({ error: 'Not found' });
    if (req.user.id !== String(a.teacher_id)) return res.status(403).json({ error: 'Forbidden' });

    const { title, subject, difficulty, due_date, questions, teaching_directive } = req.body;
    if (title !== undefined) a.title = title;
    if (subject !== undefined) a.subject = subject;
    if (difficulty !== undefined) a.difficulty = difficulty;
    if (due_date !== undefined) a.due_date = due_date;
    if (teaching_directive !== undefined) a.teaching_directive = teaching_directive;
    if (Array.isArray(questions)) {
      a.questions = questions.map((q, i) => ({
        question_id: String(q.question_id || `q${i + 1}`),
        prompt: q.prompt,
        expected_answer: q.expected_answer ?? '',
        points: Number(q.points) || 0
      }));
    }
    await a.save();
    return res.json({ success: true, _id: String(a._id) });
  } catch (err) {
    next(err);
  }
};
