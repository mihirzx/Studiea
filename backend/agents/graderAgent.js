// Agent 3 — Grader
// Input: submission_id.
import { generateJSON } from '../utils/gemini.js';
import { buildGraderPrompt } from '../utils/promptBuilder.js';
import { validateGrade } from '../utils/validateAgentOutput.js';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import Teacher from '../models/Teacher.js';

// Serialize the rubric (expected answers) and the student's answers, matched by question_id,
// into compact text blocks for the XML-isolated prompt.
const buildRubricAndAnswers = (questions, answers) => {
  const answerById = new Map(answers.map((a) => [a.question_id, a.answer]));
  const rubric = questions
    .map((q, i) => `Q${i + 1} (${q.points ?? 0} pts) [${q.question_id}]: ${q.prompt}\nExpected: ${q.expected_answer ?? ''}`)
    .join('\n\n');
  const studentAnswers = questions
    .map((q, i) => `Q${i + 1} [${q.question_id}]: ${answerById.get(q.question_id) ?? '(no answer)'}`)
    .join('\n\n');
  return { rubric, studentAnswers };
};

/**
 * Grade a submission, flag if below the teacher's threshold, then trigger Study Buddy.
 * Does NOT set `score` or touch student_progress — teacher approval gates that.
 *
 * @param {{ submissionId: string }} input
 * @returns {Promise<object>} the updated submission
 */
export const runGrader = async ({ submissionId }) => {
  // Step 1: read submission + assignment (with the hidden expected_answer field).
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error('Submission not found');
  const assignment = await Assignment.findById(submission.assignment_id).select('+questions.expected_answer');
  if (!assignment) throw new Error('Assignment not found');

  // Steps 2-3: build the rubric-weighted prompt and grade with Gemini.
  const { rubric, studentAnswers } = buildRubricAndAnswers(assignment.questions, submission.answers);
  const raw = await generateJSON(buildGraderPrompt(rubric, studentAnswers));

  // Step 4: validate the agent output before persisting.
  const { score, feedback, weak_areas } = validateGrade(raw);

  // Step 5: write proposed_score + feedback + weak_areas. Flag if below threshold.
  const teacher = await Teacher.findById(assignment.teacher_id).select('threshold_pct');
  const threshold = teacher?.threshold_pct ?? 70;
  submission.proposed_score = score;
  submission.feedback = feedback;
  submission.weak_areas = weak_areas;
  submission.status = score < threshold ? 'flagged' : 'pending_approval';
  await submission.save();

  // Step 7: trigger Study Buddy daily-plan generation (agent-only endpoint).
  try {
    await fetch(`${process.env.INTERNAL_API_URL}/study-plans/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_SECRET },
      body: JSON.stringify({ student_id: String(submission.student_id), submission_id: String(submission._id) })
    });
  } catch {
    // Non-fatal: grading already succeeded; the plan can be regenerated later.
  }

  return submission;
};
