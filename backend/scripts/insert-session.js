/**
 * Inserts the pre-transcribed physics session for Ms. Johnson.
 * Run from repo root:  npm run seed:session
 * Idempotent — deletes any previous version first.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Teacher from '../models/Teacher.js';
import Session from '../models/Session.js';
import { PHYSICS_SESSION } from '../../seed/session-data.js';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in backend/.env');
  await mongoose.connect(uri);

  const teacher = await Teacher.findOne({ email: PHYSICS_SESSION.teacherEmail });
  if (!teacher) throw new Error('Seed teacher not found — run npm run seed first');

  // Remove any previous version of this session (idempotent)
  await Session.deleteMany({
    teacher_id: teacher._id,
    'structured_notes.topics': { $elemMatch: { $regex: /Coulomb/i } },
  });

  const { structured_notes, transcript, recordedDaysAgo } = PHYSICS_SESSION;

  const session = await Session.create({
    teacher_id: teacher._id,
    transcript,
    structured_notes,
    syllabus_context: [...structured_notes.topics, ...structured_notes.objectives].join('; '),
    recorded_at: new Date(Date.now() - recordedDaysAgo * 24 * 60 * 60 * 1000),
  });

  console.log('Session inserted:', String(session._id));
  console.log('Teacher :', teacher.name, `(${teacher.email})`);
  console.log('Topics  :', structured_notes.topics.join(' · '));
  console.log('\nLog in as', PHYSICS_SESSION.teacherEmail, '→ Session Upload to see it listed,');
  console.log('or use the session ID above to generate an assignment from it.');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Insert failed:', err.message);
  process.exit(1);
});
