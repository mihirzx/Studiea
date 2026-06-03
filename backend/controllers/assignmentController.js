// Assignment controller (Agent 2). Never return expected_answer to clients
// (select: false on the schema handles this by default).
// import { runHwGenerator } from '../agents/hwGeneratorAgent.js';

// POST /assignments/generate — trigger HW generation from session_id.
export const generate = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: generate' });
};

// GET /assignments/:id — assignment + questions (teacher owner or assigned student).
export const getById = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: getById' });
};

// GET /assignments/student/:student_id — all assignments for a student (own only).
export const listByStudent = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: listByStudent' });
};

// GET /assignments/teacher/:teacher_id — all assignments by a teacher (own only).
export const listByTeacher = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: listByTeacher' });
};

// PATCH /assignments/:id — teacher edits generated assignment (verify ownership).
export const update = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: update' });
};
