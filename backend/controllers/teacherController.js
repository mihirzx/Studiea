// Teacher controller. Every route verifies req.user.id === :id (own resources only).
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import StudentProgress from '../models/StudentProgress.js';

const ensureSelf = (req, res) => {
  if (req.user.id !== req.params.id) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
};

// GET /teacher/:id — own profile.
export const getProfile = async (req, res, next) => {
  try {
    if (!ensureSelf(req, res)) return;
    const teacher = await Teacher.findById(req.params.id); // password is select:false
    if (!teacher) return res.status(404).json({ error: 'Not found' });
    return res.json(teacher);
  } catch (err) {
    next(err);
  }
};

// PATCH /teacher/:id/threshold — set alert threshold.
export const setThreshold = async (req, res, next) => {
  try {
    if (!ensureSelf(req, res)) return;
    const threshold = Number(req.body.threshold_pct);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      return res.status(400).json({ error: 'threshold_pct must be 0-100' });
    }
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, { threshold_pct: threshold }, { new: true });
    return res.json({ success: true, threshold_pct: teacher.threshold_pct });
  } catch (err) {
    next(err);
  }
};

// GET /teacher/:id/students — list class students.
export const listStudents = async (req, res, next) => {
  try {
    if (!ensureSelf(req, res)) return;
    const students = await Student.find({ teacher_id: req.params.id }).select('name email overall_score');
    return res.json(students.map((s) => ({
      _id: String(s._id),
      name: s.name,
      email: s.email,
      overall_score: s.overall_score
    })));
  } catch (err) {
    next(err);
  }
};

// GET /teacher/:id/dashboard — class overview (roster + counts) for Hex/convenience.
export const getDashboard = async (req, res, next) => {
  try {
    if (!ensureSelf(req, res)) return;
    const students = await Student.find({ teacher_id: req.params.id }).select('name overall_score');
    const scores = students.map((s) => s.overall_score || 0);
    const average_score = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return res.json({
      student_count: students.length,
      average_score,
      students: students.map((s) => ({ _id: String(s._id), name: s.name, overall_score: s.overall_score }))
    });
  } catch (err) {
    next(err);
  }
};

// GET /teacher/:id/students/:student_id/stats — detailed, filterable stats for one student.
// Optional query filters: assignment_id, topic, from, to (ISO dates on submitted_at).
export const getStudentStats = async (req, res, next) => {
  try {
    if (!ensureSelf(req, res)) return; // req.user.id === :id (teacher)
    const { student_id } = req.params;
    const student = await Student.findById(student_id).catch(() => null);
    if (!student || String(student.teacher_id) !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { assignment_id, topic, from, to } = req.query;

    // Build the submission filter from the query params.
    const subFilter = { student_id };
    if (assignment_id) subFilter.assignment_id = assignment_id;
    const dateFilter = {};
    if (from && !isNaN(new Date(from).getTime())) dateFilter.$gte = new Date(from);
    if (to && !isNaN(new Date(to).getTime())) dateFilter.$lte = new Date(to);
    if (Object.keys(dateFilter).length) subFilter.submitted_at = dateFilter;

    const submissions = await Submission.find(subFilter).sort({ submitted_at: -1 });
    const assignments = await Assignment.find({ teacher_id: req.params.id }).select('_id title');
    const titleById = new Map(assignments.map((a) => [String(a._id), a.title]));
    const progress = await StudentProgress.findOne({ student_id });

    // Status counts.
    const counts = { pending: 0, flagged: 0, pending_approval: 0, approved: 0 };
    for (const s of submissions) if (counts[s.status] !== undefined) counts[s.status]++;

    // Average of approved scores only (the committed grades).
    const approvedScores = submissions.filter((s) => s.status === 'approved' && typeof s.score === 'number').map((s) => s.score);
    const average = approvedScores.length
      ? Math.round(approvedScores.reduce((a, b) => a + b, 0) / approvedScores.length)
      : null;

    // Weak-area frequency across the filtered submissions.
    const weakFreq = {};
    for (const s of submissions) for (const w of s.weak_areas || []) weakFreq[w] = (weakFreq[w] || 0) + 1;
    const weak_areas = Object.entries(weakFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([area, count]) => ({ area, count }));

    // Topic mastery, optionally filtered by topic substring.
    let topic_mastery = progress?.topic_mastery || [];
    if (topic) topic_mastery = topic_mastery.filter((t) => t.topic?.toLowerCase().includes(String(topic).toLowerCase()));

    // Score history, filtered by the same date range when provided.
    let score_history = progress?.score_history || [];
    if (dateFilter.$gte || dateFilter.$lte) {
      score_history = score_history.filter((h) => {
        const d = new Date(h.date);
        if (dateFilter.$gte && d < dateFilter.$gte) return false;
        if (dateFilter.$lte && d > dateFilter.$lte) return false;
        return true;
      });
    }

    return res.json({
      student_id: String(student._id),
      student_name: student.name,
      overall_score: student.overall_score,
      trend: progress?.trend || 'stable',
      average,
      counts,
      submission_count: submissions.length,
      by_assignment: submissions.map((s) => ({
        assignment_id: String(s.assignment_id),
        title: titleById.get(String(s.assignment_id)) || null,
        status: s.status,
        score: s.status === 'approved' ? s.score : undefined,
        proposed_score: s.proposed_score,
        submitted_at: s.submitted_at
      })),
      topic_mastery,
      weak_areas,
      score_history
    });
  } catch (err) {
    next(err);
  }
};
