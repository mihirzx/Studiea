// Protects agent-only endpoints (POST /study-plans/generate, PATCH /progress/:student_id).
// INTERNAL_SECRET must be a separate long random string, NOT the same as JWT_SECRET.
export const requireInternalSecret = (req, res, next) => {
  const secret = req.headers['x-internal-secret'];
  if (!secret || secret !== process.env.INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
