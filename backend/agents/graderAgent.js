// Agent 3 — Grader
// Input: submission_id.
import { generateJSON } from '../utils/gemini.js';
import { buildGraderPrompt } from '../utils/promptBuilder.js';
import { validateGrade } from '../utils/validateAgentOutput.js';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import Teacher from '../models/Teacher.js';

/**
 * Step 1: Read submission.answers + assignment.questions.
 *         Use .select('+questions.expected_answer') to fetch the hidden field.
 * Step 2: Teacher cheat sheet (expected_answer) — 60% weight.
 * Step 3: Gemini (40% weight) grades against rubric with XML-isolated <student_answers>.
 *         JSON: { score: 0-100, feedback: string, weak_areas: string[] }
 * Step 4: Validate output.
 * Step 5: Write proposed_score + feedback + weak_areas.
 *         status = "flagged" if score < threshold, else "pending_approval".
 *         Do NOT write `score` or update student_progress yet — teacher approval gates that.
 * Step 6: Notify teacher to review.
 * Step 7: Trigger Agent 4 (Study Buddy) with student_id + submission_id.
 *
 * @param {{ submissionId: string }} input
 */
export const runGrader = async ({ submissionId }) => {
  // TODO Step 1: const submission = await Submission.findById(submissionId);
  //              const assignment = await Assignment.findById(submission.assignment_id)
  //                .select('+questions.expected_answer');
  // TODO Step 3: const out = await generateJSON(buildGraderPrompt(expectedAnswers, answers));
  // TODO Step 4: const graded = validateGrade(out);
  // TODO Step 5: set proposed_score/feedback/weak_areas + status based on teacher.threshold_pct
  // TODO Step 7: trigger Study Buddy plan generation (internal-secret call):
  //   await fetch(`${process.env.INTERNAL_API_URL}/study-plans/generate`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_SECRET },
  //     body: JSON.stringify({ student_id, submission_id: submissionId })
  //   });
  void generateJSON; void buildGraderPrompt; void validateGrade; void Submission; void Assignment; void Teacher;
  throw new Error('Not implemented: runGrader');
};
