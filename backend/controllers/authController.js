// Auth controller — register, login (JWT with role + expiry), logout.
import { z } from 'zod';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import StudentProgress from '../models/StudentProgress.js';
import { hashPassword, comparePassword, signToken, publicUser } from '../utils/auth.js';

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
  role: z.enum(['teacher', 'student']),
  teacher_id: z.string().optional(),
  subject: z.string().trim().max(120).optional()
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1)
});

// POST /auth/register — register a teacher or student (role in body).
export const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid registration details' });
    const { name, email, password, role, teacher_id, subject } = parsed.data;

    // Email must be unique across both collections.
    const [existingT, existingS] = await Promise.all([
      Teacher.findOne({ email }),
      Student.findOne({ email })
    ]);
    if (existingT || existingS) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await hashPassword(password);

    if (role === 'teacher') {
      const teacher = await Teacher.create({ name, email, password: hashed, subject });
      return res.status(201).json({ token: signToken({ id: teacher._id, role }), user: publicUser(teacher, role) });
    }

    // Student requires a valid teacher_id.
    if (!teacher_id) return res.status(400).json({ error: 'teacher_id is required for students' });
    const teacher = await Teacher.findById(teacher_id).catch(() => null);
    if (!teacher) return res.status(400).json({ error: 'Invalid teacher_id' });

    const student = await Student.create({ teacher_id, name, email, password: hashed });
    // Seed an empty progress record so teacher/student dashboards have something to read.
    await StudentProgress.create({ student_id: student._id });

    return res.status(201).json({ token: signToken({ id: student._id, role }), user: publicUser(student, role) });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login — verify credentials, return JWT.
export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid email or password' });
    const { email, password } = parsed.data;

    // Look in both collections; password is select:false so request it explicitly.
    let user = await Teacher.findOne({ email }).select('+password');
    let role = 'teacher';
    if (!user) {
      user = await Student.findOne({ email }).select('+password');
      role = 'student';
    }
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    return res.json({ token: signToken({ id: user._id, role }), user: publicUser(user, role) });
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout — stateless JWT; client discards token.
export const logout = async (req, res) => {
  res.json({ success: true });
};
