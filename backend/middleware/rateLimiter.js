import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

// Applied to: POST /sessions/upload, POST /submissions/submit, POST /assignments/generate
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1-minute window
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Too many requests, slow down' }
});

// Applied to: POST /study-plans/chat
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip
});
