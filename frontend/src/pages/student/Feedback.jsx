import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowRight, CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import { getSubmission } from '../../api/submissions.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import CornerDecor from '../../components/CornerDecor.jsx';

function scoreColorClass(score) {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-teal-600 dark:text-teal-400';
  return 'text-violet-600 dark:text-violet-400';
}

function scoreRingClass(score) {
  if (score >= 80) return 'ring-green-200 bg-green-50 dark:ring-green-900 dark:bg-green-950/40';
  if (score >= 60) return 'ring-teal-200 bg-teal-50 dark:ring-teal-900 dark:bg-teal-950/40';
  return 'ring-violet-200 bg-violet-50 dark:ring-violet-900 dark:bg-violet-950/40';
}

function scoreHeadline(score) {
  if (score >= 80) return 'Excellent work';
  if (score >= 60) return "Good job — you're getting there";
  return 'Keep at it — every mistake is a lesson';
}

// Per-question verdict badge config. Rendered only when the backend supplies
// answer.verdict ('correct' | 'partial' | 'incorrect').
const VERDICT = {
  correct:   { Icon: CheckCircle2, label: 'Correct',    cls: 'text-green-700 bg-green-50 ring-green-200 dark:text-green-300 dark:bg-green-950/40 dark:ring-green-900' },
  partial:   { Icon: MinusCircle,  label: 'Partial',    cls: 'text-amber-700 bg-amber-50 ring-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:ring-amber-900' },
  incorrect: { Icon: XCircle,      label: 'Needs work', cls: 'text-rose-700 bg-rose-50 ring-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:ring-rose-900' },
};

function Feedback() {
  const { id } = useParams();

  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSubmission(id);
        if (!cancelled) setSubmission(data);
      } catch {
        if (!cancelled) setError('Failed to load your feedback. Try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="p-6 text-sm text-red-600 dark:text-red-400">{error}</p>;

  // Hard guard: never show score/feedback before teacher approval
  if (!submission || submission.status !== 'approved') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 p-6 dark:bg-slate-950">
        <CornerDecor />
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950/40">
            <Clock className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Almost there</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Your teacher is reviewing this submission. Your work will be graded shortly, check back soon.
          </p>
          <Link
            to="/student"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-student-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-student-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const score = submission.score;
  const weakAreas = submission.weak_areas ?? [];
  const answers = submission.answers ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 p-6 dark:bg-slate-950">
      <CornerDecor />
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Your Feedback"
          subtitle={submission.assignment_title}
          variant="student"
        />

        <div className={`mb-6 rounded-2xl p-8 text-center ring-1 ${scoreRingClass(score)}`}>
          <p className={`text-7xl font-black tracking-tight ${scoreColorClass(score)}`}>
            {score}<span className="text-4xl">%</span>
          </p>
          <p className="mt-3 text-lg font-semibold text-gray-800 dark:text-slate-200">{scoreHeadline(score)}</p>
          {submission.feedback && (
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{submission.feedback}</p>
          )}
        </div>

        {weakAreas.length > 0 && (
          <div className="mb-5 rounded-xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-900 dark:bg-violet-950/40">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
              Areas to focus on
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {weakAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-200 dark:bg-violet-900/50 dark:text-violet-200 dark:ring-violet-800"
                >
                  {area}
                </span>
              ))}
            </div>
            <Link
              to="/student/study-buddy"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-student-600 hover:underline dark:text-student-400"
            >
              Ask your Study Buddy about these
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {answers.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
              Question by Question
            </h2>
            {answers.map((a, i) => {
              const verdict = VERDICT[a.verdict];
              return (
                <div key={a.question_id || i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                      Question {i + 1}
                    </p>
                    {verdict && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${verdict.cls}`}>
                        <verdict.Icon className="h-3.5 w-3.5" />
                        {verdict.label}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                    <p className="mb-1 text-xs font-semibold text-gray-400 dark:text-slate-500">Your answer</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap dark:text-slate-300">{a.answer}</p>
                  </div>
                  {a.note && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{a.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/student"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
