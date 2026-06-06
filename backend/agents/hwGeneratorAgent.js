// Agent 2 — HW Generator
// Input: session_id.
import { generateJSON } from '../utils/gemini.js';
import { buildHwGeneratorPrompt } from '../utils/promptBuilder.js';
import { validateAssignment } from '../utils/validateAgentOutput.js';
import Session from '../models/Session.js';
import Assignment from '../models/Assignment.js';

// session.structured_notes is stored as an object; flatten it to text for the prompt.
const notesToText = (notes) => {
  if (!notes) return '';
  if (typeof notes === 'string') return notes;
  return JSON.stringify(notes);
};

/**
 * Generate a STEM assignment from a class session and save it.
 *
 * @param {{ sessionId: string, teacherId: string, teachingDirective?: string }} input
 * @returns {Promise<object>} the saved Assignment document
 */
export const runHwGenerator = async ({ sessionId, teacherId, teachingDirective }) => {
  const session = await Session.findById(sessionId);
  if (!session) throw new Error('Session not found');

  const raw = await generateJSON(
    buildHwGeneratorPrompt(session.syllabus_context || '', notesToText(session.structured_notes))
  );
  const { title, questions } = validateAssignment(raw);

  const assignment = await Assignment.create({
    session_id: session._id,
    teacher_id: teacherId,
    title,
    questions,
    ...(teachingDirective ? { teaching_directive: teachingDirective } : {})
    // subject + difficulty + due_date are set/edited by the teacher in AssignmentReview.
  });

  return assignment;
};
