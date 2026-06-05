// Teacher controller. Every route verifies req.user.id === :id (own resources only).
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

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
