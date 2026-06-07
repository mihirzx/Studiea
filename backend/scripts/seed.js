/**
 * Seed script for local development. Run from the repo root: npm run seed
 * Data lives in seed/data.js (gitignored). This file stays in backend/ so
 * it has access to node_modules (mongoose, bcryptjs, etc.).
 *
 * Safe to re-run — clears existing seed data first.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import StudentProgress from '../models/StudentProgress.js';
import StudyPlan from '../models/StudyPlan.js';
import Session from '../models/Session.js';

import {
  SEED_EMAILS, TEACHER, STUDENTS, SESSION, ASSIGNMENTS,
  STUDENT_ANSWERS, PROGRESS, STUDY_PLANS,
} from '../../seed/data.js';

const SALT = 10;
const day = 24 * 60 * 60 * 1000;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in backend/.env');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // --- Wipe existing seed data ---
  const existingTeacher = await Teacher.findOne({ email: TEACHER.email });
  if (existingTeacher) {
    const studentIds = (await Student.find({ teacher_id: existingTeacher._id })).map(s => s._id);
    await Promise.all([
      Teacher.deleteMany({ email: { $in: SEED_EMAILS } }),
      Student.deleteMany({ email: { $in: SEED_EMAILS } }),
      Assignment.deleteMany({ teacher_id: existingTeacher._id }),
      Session.deleteMany({ teacher_id: existingTeacher._id }),
      Submission.deleteMany({ student_id: { $in: studentIds } }),
      StudentProgress.deleteMany({ student_id: { $in: studentIds } }),
      StudyPlan.deleteMany({ student_id: { $in: studentIds } }),
    ]);
    console.log('Cleared existing seed data');
  }

  const passwordHash = await bcrypt.hash('password123', SALT);

  // --- Teacher ---
  const teacher = await Teacher.create({ ...TEACHER, password: passwordHash });
  console.log('Teacher created:', teacher.email);

  // --- Session ---
  const session = await Session.create({
    ...SESSION,
    teacher_id: teacher._id,
    recorded_at: new Date(Date.now() - 7 * day),
  });

  // --- Assignments ---
  const [a1, a2] = await Promise.all(
    ASSIGNMENTS.map((a, i) =>
      Assignment.create({
        ...a,
        teacher_id: teacher._id,
        session_id: i === 0 ? session._id : undefined,
        due_date: new Date(Date.now() + a.dueDaysFromNow * day),
      })
    )
  );
  console.log('Assignments created:', a1.title, '|', a2.title);

  // --- Students ---
  const students = await Student.insertMany(
    STUDENTS.map((s) => ({ ...s, teacher_id: teacher._id, password: passwordHash }))
  );
  const [alex, priya, sam, mia] = students;
  console.log('Students created:', students.map(s => s.name).join(', '));

  // --- Submissions ---
  const alexSub1 = await Submission.create({
    assignment_id: a1._id, student_id: alex._id,
    answers: STUDENT_ANSWERS.alex[0],
    proposed_score: 92, score: 92,
    feedback: 'Excellent understanding of all three laws. Your F=ma calculation is clear and correct.',
    weak_areas: [], status: 'approved', alert_approved: true,
    submitted_at: new Date(Date.now() - 2 * day),
  });

  const alexSub2 = await Submission.create({
    assignment_id: a2._id, student_id: alex._id,
    answers: STUDENT_ANSWERS.alex[1],
    proposed_score: 85, score: 85,
    feedback: 'Strong grasp of both processes. Remember to use the subscript numbers in chemical formulas.',
    weak_areas: ['Chemical notation'], status: 'approved', alert_approved: true,
    submitted_at: new Date(Date.now() - 1 * day),
  });

  // Priya — below threshold, needs teacher review
  await Submission.create({
    assignment_id: a1._id, student_id: priya._id,
    answers: STUDENT_ANSWERS.priya[0],
    proposed_score: 58, status: 'pending_approval', alert_sent: true,
    submitted_at: new Date(Date.now() - 5 * 60 * 60 * 1000),
  });

  // Sam — flagged on Newton (68 < 70 threshold), approved on Biology
  await Submission.create({
    assignment_id: a1._id, student_id: sam._id,
    answers: STUDENT_ANSWERS.sam[0],
    proposed_score: 68, status: 'flagged', alert_sent: true,
    submitted_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
  });

  const samSub2 = await Submission.create({
    assignment_id: a2._id, student_id: sam._id,
    answers: STUDENT_ANSWERS.sam[1],
    proposed_score: 76, score: 76,
    feedback: 'Good overall understanding. Try to include more specific details in your chemical equations.',
    weak_areas: ['Chemical equations', 'Chloroplast structure'],
    status: 'approved', alert_approved: true,
    submitted_at: new Date(Date.now() - 3 * day),
  });

  // Mia — just submitted, awaiting AI grading
  await Submission.create({
    assignment_id: a1._id, student_id: mia._id,
    answers: STUDENT_ANSWERS.mia[0],
    status: 'pending',
    submitted_at: new Date(Date.now() - 30 * 60 * 1000),
  });

  console.log('Submissions created');

  // --- StudentProgress ---
  const studentMap = { alex, priya, sam, mia };
  await Promise.all(
    PROGRESS.map(({ studentKey, trend, scoreHistory, topicMastery }) =>
      StudentProgress.create({
        student_id: studentMap[studentKey]._id,
        trend,
        score_history: scoreHistory.map(({ score, daysAgo }) => ({
          score,
          date: new Date(Date.now() - daysAgo * day),
        })),
        topic_mastery: topicMastery,
      })
    )
  );
  console.log('Progress records created');

  // --- StudyPlans ---
  const submissionMap = {
    'alex-bio': alexSub2._id,
    'sam-bio': samSub2._id,
  };
  await Promise.all(
    STUDY_PLANS.map(({ studentKey, submissionKey, ...plan }) =>
      StudyPlan.create({
        ...plan,
        student_id: studentMap[studentKey]._id,
        submission_id: submissionMap[submissionKey],
        generated_at: new Date(),
        valid_until: new Date(new Date().setHours(23, 59, 59, 999)),
      })
    )
  );
  console.log('Study plans created');

  // --- Summary ---
  console.log('\n=== Seed complete ===');
  console.log('\nTeacher login:');
  console.log('  Email:    ms.johnson@studiea.dev');
  console.log('  Password: password123');
  console.log('\nStudent logins (all password: password123):');
  students.forEach(s => console.log(`  ${s.name.padEnd(16)} ${s.email}`));
  console.log('\nSubmission states:');
  console.log('  Alex    — Newton approved (92%) · Biology approved (85%)');
  console.log('  Priya   — Newton pending_approval (needs review) · Biology not started');
  console.log('  Sam     — Newton flagged (68%, below threshold) · Biology approved (76%)');
  console.log('  Mia     — Newton pending (just submitted) · Biology not started');
  console.log('\nTrends: Alex improving | Priya declining | Sam stable | Mia declining');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
