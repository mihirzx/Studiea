// Session controller (Agent 1 entry points). Verify session.teacher_id === req.user.id.
import Session from '../models/Session.js';
import { validateAudioBuffer } from '../middleware/upload.js';
import { runNotetaker } from '../agents/notetakerAgent.js';

// POST /sessions/upload — dual mode:
//   - multipart 'audio' file (req.file.buffer) -> validate magic bytes -> GCS + Speech-to-Text
//   - OR a 'transcript' text field -> used directly (dev/demo fallback)
export const upload = async (req, res, next) => {
  try {
    const transcript = req.body?.transcript;
    let audioBuffer;
    let mimeType;

    if (req.file?.buffer) {
      await validateAudioBuffer(req.file.buffer);
      audioBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    }

    if (!transcript && !audioBuffer) {
      return res.status(400).json({ error: 'Provide an audio file or a transcript' });
    }

    // Optional calendar date for backdated/previous sessions. Ignore if unparseable -> defaults to now.
    let recordedAt;
    if (req.body?.recorded_at) {
      const d = new Date(req.body.recorded_at);
      if (!isNaN(d.getTime())) recordedAt = d;
    }

    const session = await runNotetaker({ teacherId: req.user.id, audioBuffer, mimeType, transcript, recordedAt });
    return res.status(201).json({
      _id: String(session._id),
      recorded_at: session.recorded_at,
      structured_notes: session.structured_notes
    });
  } catch (err) {
    next(err);
  }
};

// POST /sessions/live — live WebSocket transcription (not used by the current UI).
export const live = async (req, res) => {
  res.status(501).json({ error: 'Live transcription not implemented' });
};

// GET /sessions/:id — structured notes (owner teacher only).
export const getById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).catch(() => null);
    if (!session) return res.status(404).json({ error: 'Not found' });
    if (req.user.id !== String(session.teacher_id)) return res.status(403).json({ error: 'Forbidden' });
    return res.json(session);
  } catch (err) {
    next(err);
  }
};

// GET /sessions/teacher/:teacher_id — list all sessions for the teacher.
export const listByTeacher = async (req, res, next) => {
  try {
    const { teacher_id } = req.params;
    if (req.user.id !== teacher_id) return res.status(403).json({ error: 'Forbidden' });
    const sessions = await Session.find({ teacher_id }).sort({ recorded_at: -1 });
    return res.json(sessions.map((s) => ({
      _id: String(s._id),
      recorded_at: s.recorded_at,
      structured_notes: s.structured_notes
    })));
  } catch (err) {
    next(err);
  }
};
