// Submission controller (Agent 3). Ownership is checked per-document, not by role alone.
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import Student from '../models/Student.js';
import { sanitizeText } from '../utils/sanitize.js';
import { runGrader } from '../agents/graderAgent.js';

// Shape a submission for the student view: hide score/feedback/weak_areas until approved.
const studentSafe = (sub, assignmentTitle) => {
  const base = {
    _id: String(sub._id),
    assignment_id: String(sub.assignment_id),
    assignment_title: assignmentTitle,
    status: sub.status,
    answers: sub.answers,
    submitted_at: sub.submitted_at
  };
  if (sub.status === 'approved') {
    base.score = sub.score;
    base.feedback = sub.feedback;
    base.weak_areas = sub.weak_areas;
  }
  return base;
};

// POST /submissions/submit — student submits answers, then trigger grading.
export const submit = async (req, res, next) => {
  try {
    const { assignment_id, answers } = req.body;
    if (!assignment_id || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'assignment_id and answers are required' });
    }

    const assignment = await Assignment.findById(assignment_id).catch(() => null);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Block duplicate submissions for the same student+assignment.
    const existing = await Submission.findOne({ assignment_id, student_id: req.user.id });
    if (existing) return res.status(409).json({ error: 'You have already submitted this assignment' });

    const cleanAnswers = answers.map((a) => ({
      question_id: String(a.question_id),
      answer: sanitizeText(a.answer)
    }));

    const submission = await Submission.create({
      assignment_id,
      student_id: req.user.id,
      answers: cleanAnswers,
      status: 'pending'
    });

    // Grade synchronously so the UI reflects the new status on next refresh.
    try {
      await runGrader({ submissionId: submission._id });
    } catch (err) {
      // Grading failure shouldn't lose the submission; leave it 'pending' for retry.
      console.error('Grading failed:', err.message);
    }

    const fresh = await Submission.findById(submission._id);
    return res.status(201).json({ _id: String(fresh._id), status: fresh.status });
  } catch (err) {
    next(err);
  }
};

// GET /submissions/:id — teacher (owns assignment) or student (own submission).
export const getById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).catch(() => null);
    if (!submission) return res.status(404).json({ error: 'Not found' });
    const assignment = await Assignment.findById(submission.assignment_id);

    if (req.user.role === 'student') {
      if (req.user.id !== String(submission.student_id)) return res.status(403).json({ error: 'Forbidden' });
      return res.json(studentSafe(submission, assignment?.title));
    }
    // teacher: must own the assignment; sees everything including proposed_score.
    if (!assignment || req.user.id !== String(assignment.teacher_id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json({ ...submission.toObject(), assignment_title: assignment.title });
  } catch (err) {
    next(err);
  }
};

// GET /submissions/student/:student_id — student (own) or teacher (owns the student).
export const listByStudent = async (req, res, next) => {
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
    const subs = await Submission.find({ student_id }).sort({ submitted_at: -1 });
    return res.json(subs.map((s) => ({
      _id: String(s._id),
      assignment_id: String(s.assignment_id),
      status: s.status,
      ...(s.status === 'approved' ? { score: s.score } : {}),
      submitted_at: s.submitted_at
    })));
  } catch (err) {
    next(err);
  }
};

// GET /submissions/assignment/:assignment_id — teacher (owns the assignment).
export const listByAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.assignment_id).catch(() => null);
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    if (req.user.id !== String(assignment.teacher_id)) return res.status(403).json({ error: 'Forbidden' });

    const subs = await Submission.find({ assignment_id: assignment._id }).populate('student_id', 'name');
    return res.json(subs.map((s) => ({
      _id: String(s._id),
      student_id: String(s.student_id?._id || s.student_id),
      student_name: s.student_id?.name,
      status: s.status,
      proposed_score: s.proposed_score,
      score: s.score,
      submitted_at: s.submitted_at
    })));
  } catch (err) {
    next(err);
  }
};

// GET /submissions/pending-alerts/:teacher_id — flagged submissions awaiting approval.
export const pendingAlerts = async (req, res, next) => {
  try {
    const { teacher_id } = req.params;
    if (req.user.id !== teacher_id) return res.status(403).json({ error: 'Forbidden' });

    const assignments = await Assignment.find({ teacher_id }).select('_id title');
    const titleById = new Map(assignments.map((a) => [String(a._id), a.title]));

    const subs = await Submission.find({
      assignment_id: { $in: assignments.map((a) => a._id) },
      status: { $in: ['flagged', 'pending_approval'] }
    }).populate('student_id', 'name').sort({ submitted_at: -1 });

    return res.json(subs.map((s) => ({
      _id: String(s._id),
      status: s.status,
      student_id: String(s.student_id?._id || s.student_id),
      student_name: s.student_id?.name,
      assignment_id: String(s.assignment_id),
      assignment_title: titleById.get(String(s.assignment_id)),
      proposed_score: s.proposed_score,
      feedback: s.feedback,
      answers: s.answers,
      submitted_at: s.submitted_at
    })));
  } catch (err) {
    next(err);
  }
};

// PATCH /submissions/:id/approve — approve alert -> student sees feedback.
// Verbatim from the technical bible: ownership check + commit score + internal progress update.
export const approveSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Not found' });

  // Verify the approving teacher owns this assignment
  const assignment = await Assignment.findById(submission.assignment_id);
  if (!assignment.teacher_id.equals(req.user.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await Submission.findByIdAndUpdate(req.params.id, {
    score: submission.proposed_score,
    status: 'approved',
    alert_approved: true
  });

  // Only now is it safe to update the student's progress record
  await fetch(`${process.env.INTERNAL_API_URL}/progress/${submission.student_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.INTERNAL_SECRET
    },
    body: JSON.stringify({ score: submission.proposed_score, assignment_id: submission.assignment_id })
  });

  res.json({ success: true });
};
