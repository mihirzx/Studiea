// Auth controller — register, login (JWT with role + expiry), logout.
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import Teacher from '../models/Teacher.js';
// import Student from '../models/Student.js';

// POST /auth/register — register a teacher or student (role in body).
export const register = async (req, res) => {
  // TODO: validate body (zod), hash password (bcrypt), create Teacher or Student.
  res.status(501).json({ error: 'Not implemented: register' });
};

// POST /auth/login — verify credentials, return JWT.
export const login = async (req, res) => {
  // TODO: look up user (.select('+password')), bcrypt.compare, then issue token:
  //   const token = jwt.sign(
  //     { id: user._id, role: user.role },
  //     process.env.JWT_SECRET,
  //     { expiresIn: '8h' }   // never omit — tokens without expiry are valid forever
  //   );
  void jwt;
  res.status(501).json({ error: 'Not implemented: login' });
};

// POST /auth/logout — stateless JWT; client discards token (optional denylist).
export const logout = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: logout' });
};
