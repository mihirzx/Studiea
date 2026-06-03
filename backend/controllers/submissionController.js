// Submission controller (Agent 3). Ownership is checked per-document, not by role alone.
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
// import { runGrader } from '../agents/graderAgent.js';

// POST /submissions/submit — student submits answers, then trigger grading.
export const submit = async (req, res) => {
  // TODO: sanitize answers, create Submission(status: 'pending'), then runGrader({ submissionId }).
  res.status(501).json({ error: 'Not implemented: submit' });
};

// GET /submissions/:id — teacher (owns assignment) or student (own submission).
export const getById = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: getById' });
};

// GET /submissions/student/:student_id — student (own) or teacher.
export const listByStudent = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: listByStudent' });
};

// GET /submissions/assignment/:assignment_id — teacher (owns assignment).
export const listByAssignment = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: listByAssignment' });
};

// GET /submissions/pending-alerts/:teacher_id — flagged submissions awaiting approval.
export const pendingAlerts = async (req, res) => {
  res.status(501).json({ error: 'Not implemented: pendingAlerts' });
};

// PATCH /submissions/:id/approve — approve alert -> student sees feedback.
// Verbatim from the technical bible: ownership check + commit score + internal progress update.
export const approveSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Not found' });

  // Verify the approving teacher owns this assignment
  const assignment = await Assignment.findById(submission.assignment_id);
  if (!assignment.teacher_id.equals(req.user.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await Submission.findByIdAndUpdate(req.params.id, {
    score: submission.proposed_score,
    status: 'approved',
    alert_approved: true
  });

  // Only now is it safe to update the student's progress record
  await fetch(`${process.env.INTERNAL_API_URL}/progress/${submission.student_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.INTERNAL_SECRET
    },
    body: JSON.stringify({ score: submission.proposed_score, assignment_id: submission.assignment_id })
  });

  res.json({ success: true });
};
