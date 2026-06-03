// Agent 2 — HW Generator
// Input: session_id.
import { generateJSON } from '../utils/gemini.js';
import { buildHwGeneratorPrompt } from '../utils/promptBuilder.js';
import { validateAssignment } from '../utils/validateAgentOutput.js';
import Session from '../models/Session.js';
import Assignment from '../models/Assignment.js';

/**
 * Step 1: Read session.structured_notes + session.syllabus_context.
 * Step 2: Gemini -> 5 STEM questions of varying difficulty.
 *         JSON: { title, questions: [{ question_id, prompt, expected_answer, points }] }
 * Step 3: Validate output (5 questions, all fields present).
 * Step 4: Save assignment.
 * Step 5: Return assignment_id.
 *
 * @param {{ sessionId: string, teacherId: string }} input
 * @returns {Promise<string>} assignment_id
 */
export const runHwGenerator = async ({ sessionId, teacherId }) => {
  // TODO Step 1: const session = await Session.findById(sessionId);
  // TODO Step 2: const out = await generateJSON(buildHwGeneratorPrompt(session.syllabus_context, session.structured_notes));
  // TODO Step 3: const valid = validateAssignment(out);
  // TODO Step 4: const assignment = await Assignment.create({ session_id: sessionId, teacher_id: teacherId, ...valid });
  // TODO Step 5: return assignment._id;
  void generateJSON; void buildHwGeneratorPrompt; void validateAssignment; void Session; void Assignment;
  throw new Error('Not implemented: runHwGenerator');
};
