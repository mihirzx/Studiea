import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getPendingAlerts, approveSubmission } from '../../api/submissions.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import AlertBadge from '../../components/AlertBadge.jsx';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';

function SubmissionCard({ submission, onApprove, isApproving }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">
            {submission.student_name || submission.student_id}
          </p>
          <p className="mt-0.5 text-sm text-slate-500 truncate">
            {submission.assignment_title || 'Assignment'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Submitted {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <AlertBadge status={submission.status} />
          <p className="text-2xl font-bold text-slate-900">
            {submission.proposed_score != null ? `${submission.proposed_score}%` : '—'}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-2">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="text-xs font-medium text-teacher-700 hover:underline"
        >
          {isExpanded ? 'Hide details ↑' : 'View submission ↓'}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          {Array.isArray(submission.answers) && submission.answers.map((a, i) => (
            <div key={a.question_id || i} className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">Question {i + 1}</p>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">{a.answer}</p>
            </div>
          ))}
          {submission.feedback && (
            <div className="rounded-lg bg-indigo-50 p-3">
              <p className="text-xs font-semibold text-indigo-600 mb-1">AI Feedback</p>
              <p className="text-sm text-slate-800">{submission.feedback}</p>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-slate-100 px-5 py-3 flex justify-end">
        <button
          onClick={() => onApprove(submission._id)}
          disabled={isApproving}
          className="rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teacher-800 disabled:opacity-60"
        >
          {isApproving ? 'Approving…' : 'Approve'}
        </button>
      </div>
    </div>
  );
}

function PendingAlerts() {
  const { user } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [approvingIds, setApprovingIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPendingAlerts(user.id);
        if (!cancelled) setSubmissions(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError('Something went wrong. Try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  async function handleConfirmApprove() {
    const id = confirmId;
    setConfirmId(null);
    setApprovingIds((prev) => new Set(prev).add(id));
    try {
      await approveSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
    } catch {
      setError('Failed to approve submission. Please try again.');
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (isLoading) return <LoadingSpinner />;

  const flagged = submissions.filter((s) => s.status === 'flagged');
  const pendingApproval = submissions.filter((s) => s.status === 'pending_approval');

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Pending Alerts"
          subtitle={`${submissions.length} item${submissions.length !== 1 ? 's' : ''} need your attention`}
          variant="teacher"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {submissions.length === 0 ? (
          <EmptyState
            icon="✅"
            title="All clear!"
            description="No submissions are waiting for your review right now."
          />
        ) : (
          <div className="space-y-6">
            {flagged.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-red-600">
                  Flagged — needs review ({flagged.length})
                </h2>
                <div className="space-y-4">
                  {flagged.map((s) => (
                    <SubmissionCard
                      key={s._id}
                      submission={s}
                      onApprove={setConfirmId}
                      isApproving={approvingIds.has(s._id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {pendingApproval.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-yellow-700">
                  Pending approval ({pendingApproval.length})
                </h2>
                <div className="space-y-4">
                  {pendingApproval.map((s) => (
                    <SubmissionCard
                      key={s._id}
                      submission={s}
                      onApprove={setConfirmId}
                      isApproving={approvingIds.has(s._id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <Modal
          open={confirmId !== null}
          onClose={() => setConfirmId(null)}
          title="Approve submission?"
          footer={
            <>
              <button
                onClick={() => setConfirmId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teacher-800"
              >
                Approve
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            This will release the score and AI feedback to the student.{' '}
            <strong>This action cannot be undone.</strong>
          </p>
        </Modal>
      </div>
    </div>
  );
}

export default PendingAlerts;
