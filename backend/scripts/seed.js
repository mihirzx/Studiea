// Seed realistic demo data: 1 teacher, 6 students, a session, an assignment, and
// a few submissions in mixed states (approved / flagged / pending_approval).
//
//   node scripts/seed.js
//
// WARNING: wipes the Studiea collections first. Point MONGODB_URI at a dev database.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Session from '../models/Session.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import StudentProgress from '../models/StudentProgress.js';
import StudyPlan from '../models/StudyPlan.js';
import ChatMessage from '../models/ChatMessage.js';
import { hashPassword } from '../utils/auth.js';

const STUDENT_NAMES = ['Ava Chen', 'Liam Patel', 'Maya Gomez', 'Noah Kim', 'Zoe Williams', 'Ethan Brooks'];

const run = async () => {
  await connectDB();
  await Promise.all([
    Teacher.deleteMany({}), Student.deleteMany({}), Session.deleteMany({}),
    Assignment.deleteMany({}), Submission.deleteMany({}), StudentProgress.deleteMany({}),
    StudyPlan.deleteMany({}), ChatMessage.deleteMany({})
  ]);

  const password = await hashPassword('password123');

  const teacher = await Teacher.create({
    name: 'Dr. Rivera', email: 'teacher@studiea.dev', password,
    subject: 'Physical Science', threshold_pct: 70
  });

  const students = await Student.insertMany(
    STUDENT_NAMES.map((name, i) => ({
      teacher_id: teacher._id,
      name,
      email: `student${i + 1}@studiea.dev`,
      password,
      overall_score: 0
    }))
  );

  const session = await Session.create({
    teacher_id: teacher._id,
    transcript: 'Today we covered Newton\'s second law, F = ma, with worked examples on acceleration...',
    structured_notes: {
      topics: ["Newton's Second Law", 'Force and Acceleration', 'Units of Force'],
      objectives: ['Apply F = ma to solve for an unknown', 'Identify units (newtons)'],
      examples: ['A 2 kg cart pushed with 10 N accelerates at 5 m/s^2'],
      homework_hints: ['Practice rearranging F = ma for each variable']
    },
    syllabus_context: "Newton's Second Law; Force and Acceleration; Units of Force"
  });

  const assignment = await Assignment.create({
    session_id: session._id,
    teacher_id: teacher._id,
    title: "Newton's Second Law Practice",
    subject: 'Physical Science',
    difficulty: 'medium',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    questions: [
      { question_id: 'q1', prompt: 'State Newton\'s second law as an equation.', expected_answer: 'F = ma', points: 20 },
      { question_id: 'q2', prompt: 'A 4 kg object accelerates at 3 m/s^2. What net force acts on it?', expected_answer: '12 N', points: 20 },
      { question_id: 'q3', prompt: 'What are the SI units of force?', expected_answer: 'Newtons (kg·m/s^2)', points: 20 },
      { question_id: 'q4', prompt: 'If force doubles and mass stays the same, what happens to acceleration?', expected_answer: 'It doubles', points: 20 },
      { question_id: 'q5', prompt: 'Rearrange F = ma to solve for mass.', expected_answer: 'm = F / a', points: 20 }
    ]
  });

  // Empty progress records for all students.
  await StudentProgress.insertMany(students.map((s) => ({ student_id: s._id })));

  // A few submissions in different states to populate teacher alerts + student feedback.
  const mk = (student, answers, { status, proposed, score, feedback, weak }) => ({
    assignment_id: assignment._id,
    student_id: student._id,
    answers,
    proposed_score: proposed,
    score: status === 'approved' ? score : undefined,
    feedback,
    weak_areas: weak,
    alert_approved: status === 'approved',
    status,
    submitted_at: new Date()
  });

  const goodAnswers = [
    { question_id: 'q1', answer: 'F = ma' },
    { question_id: 'q2', answer: '12 N' },
    { question_id: 'q3', answer: 'Newtons' },
    { question_id: 'q4', answer: 'It doubles' },
    { question_id: 'q5', answer: 'm = F / a' }
  ];
  const weakAnswers = [
    { question_id: 'q1', answer: 'F = ma' },
    { question_id: 'q2', answer: '7 N' },
    { question_id: 'q3', answer: 'kilograms' },
    { question_id: 'q4', answer: 'it goes up' },
    { question_id: 'q5', answer: 'm = a / F' }
  ];

  await Submission.create(mk(students[0], goodAnswers, {
    status: 'approved', proposed: 95, score: 95,
    feedback: 'Excellent work — clear and correct throughout.', weak: []
  }));
  await Submission.create(mk(students[1], weakAnswers, {
    status: 'flagged', proposed: 45,
    feedback: 'Review units of force and rearranging equations.', weak: ['Units of Force', 'Equation rearrangement']
  }));
  await Submission.create(mk(students[2], goodAnswers, {
    status: 'pending_approval', proposed: 85,
    feedback: 'Strong understanding; minor unit slip.', weak: ['Units of Force']
  }));

  // Reflect the approved score in progress + overall for student[0].
  await StudentProgress.updateOne(
    { student_id: students[0]._id },
    {
      $push: { score_history: { score: 95, assignment_id: assignment._id, date: new Date() } },
      $set: { trend: 'stable', topic_mastery: [{ topic: "Newton's Second Law", mastery_score: 95 }] }
    }
  );
  await Student.updateOne({ _id: students[0]._id }, { overall_score: 95 });

  console.log('Seed complete:');
  console.log('  Teacher: teacher@studiea.dev / password123');
  console.log(`  Students: student1..6@studiea.dev / password123 (teacher_id: ${teacher._id})`);
  console.log(`  Assignment: ${assignment.title} (${assignment._id})`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
