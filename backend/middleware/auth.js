import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
  next();
};

// NOTE: Do NOT use a generic requireOwnership middleware for resource-level checks.
// Ownership must be verified in each controller by comparing req.user.id against
// a field on the fetched document (e.g. session.teacher_id, submission.student_id).
// A role-only check allows any teacher to access any other teacher's resources.
// See controller examples in the Sessions and Submissions sections of the bible.
