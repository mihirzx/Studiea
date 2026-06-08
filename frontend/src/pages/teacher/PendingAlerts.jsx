import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
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
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate dark:text-slate-100">
            {submission.student_name || submission.student_id}
          </p>
          <p className="mt-0.5 text-sm text-gray-500 truncate dark:text-slate-400">
            {submission.assignment_title || 'Assignment'}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
            Submitted {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <AlertBadge status={submission.status} />
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {submission.proposed_score != null ? `${submission.proposed_score}%` : '—'}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-50 px-5 py-2.5 dark:border-slate-800">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-teacher-700 hover:text-teacher-800 dark:text-teacher-300 dark:hover:text-teacher-200"
        >
          {isExpanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Hide details</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> View submission</>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-50 px-5 py-4 space-y-3 dark:border-slate-800">
          {Array.isArray(submission.answers) && submission.answers.map((a, i) => (
            <div key={a.question_id || i} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-xs font-semibold text-gray-400 mb-1 dark:text-slate-500">Question {i + 1}</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap dark:text-slate-200">{a.answer}</p>
            </div>
          ))}
          {submission.feedback && (
            <div className="rounded-lg bg-teacher-50 p-3 ring-1 ring-teacher-100 dark:bg-teacher-900/30 dark:ring-teacher-800">
              <p className="text-xs font-semibold text-teacher-700 mb-1 dark:text-teacher-300">AI Feedback</p>
              <p className="text-sm text-gray-800 dark:text-slate-200">{submission.feedback}</p>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-50 px-5 py-3 flex justify-end dark:border-slate-800">
        <button
          onClick={() => onApprove(submission._id)}
          disabled={isApproving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teacher-800 disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" />
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
      setError('Failed to approve. Please try again.');
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
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Pending Alerts"
          subtitle={`${submissions.length} item${submissions.length !== 1 ? 's' : ''} need your attention`}
          variant="teacher"
        />

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900">
            {error}
          </p>
        )}

        {submissions.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All clear"
            description="No submissions are waiting for your review."
          />
        ) : (
          <div className="space-y-6">
            {flagged.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
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
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Pending Approval ({pendingApproval.length})
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
          title="Approve this submission?"
          footer={
            <>
              <button
                onClick={() => setConfirmId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teacher-800"
              >
                Approve
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-slate-400">
            This will release the score and feedback to the student.{' '}
            <strong className="text-gray-800 dark:text-slate-200">This action cannot be undone.</strong>
          </p>
        </Modal>
      </div>
    </div>
  );
}

export default PendingAlerts;
