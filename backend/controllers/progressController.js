// Progress controller.
// GET /progress/:student_id — teacher or student (own).
export const getByStudent = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: getByStudent' });
};

// GET /progress/class/:teacher_id — class-wide view for Hex.
export const getClass = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: getClass' });
};

// PATCH /progress/:student_id — internal secret only (Grader, after teacher approval).
// Appends to score_history, recomputes topic_mastery + trend, updates Student.overall_score.
export const update = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: update' });
};
