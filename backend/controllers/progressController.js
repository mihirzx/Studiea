// Progress controller.
import Student from '../models/Student.js';
import StudentProgress from '../models/StudentProgress.js';

// Recompute a simple trend from the last few scores.
const computeTrend = (history) => {
  if (history.length < 2) return 'stable';
  const recent = history.slice(-3).map((h) => h.score);
  const first = recent[0];
  const last = recent[recent.length - 1];
  if (last - first > 3) return 'improving';
  if (first - last > 3) return 'declining';
  return 'stable';
};

const average = (nums) =>
  nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;

// GET /progress/:student_id — teacher (owns student) or student (own).
export const getByStudent = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const student = await Student.findById(student_id).catch(() => null);
    if (!student) return res.status(404).json({ error: 'Not found' });

    // Ownership: student can only read own; teacher must own the student.
    if (req.user.role === 'student' && req.user.id !== String(student._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role === 'teacher' && req.user.id !== String(student.teacher_id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const progress = await StudentProgress.findOne({ student_id });
    if (!progress) return res.json(null);

    return res.json({
      student_id: String(student._id),
      student_name: student.name,
      overall_score: student.overall_score,
      score_history: progress.score_history,
      topic_mastery: progress.topic_mastery,
      trend: progress.trend
    });
  } catch (err) {
    next(err);
  }
};

// GET /progress/class/:teacher_id — class-wide aggregate for Hex / teacher dashboard.
export const getClass = async (req, res, next) => {
  try {
    const { teacher_id } = req.params;
    if (req.user.id !== teacher_id) return res.status(403).json({ error: 'Forbidden' });

    const students = await Student.find({ teacher_id }).select('_id overall_score');
    const ids = students.map((s) => s._id);
    const progressDocs = await StudentProgress.find({ student_id: { $in: ids } });

    // Flatten every score_history point into one class-wide trend series, sorted by date.
    const score_history = progressDocs
      .flatMap((p) => p.score_history.map((h) => ({ score: h.score, date: h.date })))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.json({
      average_score: average(students.map((s) => s.overall_score || 0)),
      student_count: students.length,
      score_history
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /progress/:student_id — internal secret only (called after teacher approval).
// Body: { score, assignment_id }. Appends to history, recomputes trend + Student.overall_score.
export const update = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const score = Number(req.body.score);
    if (isNaN(score)) return res.status(400).json({ error: 'Invalid score' });
    const { assignment_id } = req.body;

    const progress = await StudentProgress.findOne({ student_id })
      || new StudentProgress({ student_id, score_history: [], topic_mastery: [] });

    progress.score_history.push({ score, assignment_id, date: new Date() });
    progress.trend = computeTrend(progress.score_history);
    progress.updated_at = new Date();
    await progress.save();

    // Roll the student's overall_score as the mean of all recorded scores.
    const overall = average(progress.score_history.map((h) => h.score));
    await Student.findByIdAndUpdate(student_id, { overall_score: overall });

    return res.json({ success: true, overall_score: overall, trend: progress.trend });
  } catch (err) {
    next(err);
  }
};
