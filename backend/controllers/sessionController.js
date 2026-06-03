// Session controller (Agent 1 entry points). Verify session.teacher_id === req.user.id.
// import { validateAudioBuffer } from '../middleware/upload.js';
// import { runNotetaker } from '../agents/notetakerAgent.js';

// POST /sessions/upload — multer (audioUpload) provides req.file.buffer.
// 1) await validateAudioBuffer(req.file.buffer)  2) upload to GCS  3) runNotetaker(...)
export const upload = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: upload' });
};

// POST /sessions/live — start live WebSocket transcription.
export const live = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: live' });
};

// GET /sessions/:id — structured notes (owner teacher only).
export const getById = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: getById' });
};

// GET /sessions/teacher/:teacher_id — list all sessions.
export const listByTeacher = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: listByTeacher' });
};
