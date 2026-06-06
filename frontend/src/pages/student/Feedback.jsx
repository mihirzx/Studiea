import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { getSubmission } from '../../api/submissions.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function scoreColorClass(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-500';
  return 'text-violet-600';
}

function scoreRingClass(score) {
  if (score >= 80) return 'ring-green-200 bg-green-50';
  if (score >= 60) return 'ring-amber-200 bg-amber-50';
  return 'ring-violet-200 bg-violet-50';
}

function scoreHeadline(score) {
  if (score >= 80) return 'Excellent work';
  if (score >= 60) return "Good job — you're getting there";
  return 'Keep at it — every mistake is a lesson';
}

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
  if (error) return <p className="p-6 text-sm text-red-600">{error}</p>;

  // Hard guard: never show score/feedback before teacher approval
  if (!submission || submission.status !== 'approved') {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Almost there</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your teacher is reviewing this submission. Your work is in good hands — check back soon.
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Your Feedback"
          subtitle={submission.assignment_title}
          variant="student"
        />

        <div className={`mb-6 rounded-2xl p-8 text-center ring-1 ${scoreRingClass(score)}`}>
          <p className={`text-7xl font-black tracking-tight ${scoreColorClass(score)}`}>
            {score}<span className="text-4xl">%</span>
          </p>
          <p className="mt-3 text-lg font-semibold text-gray-800">{scoreHeadline(score)}</p>
          {submission.feedback && (
            <p className="mt-2 text-sm text-gray-500">{submission.feedback}</p>
          )}
        </div>

        {weakAreas.length > 0 && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Areas to focus on
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {weakAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
                >
                  {area}
                </span>
              ))}
            </div>
            <Link
              to="/student/study-buddy"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-student-600 hover:underline"
            >
              Ask your Study Buddy about these
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {answers.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Question by Question
            </h2>
            {answers.map((a, i) => (
              <div key={a.question_id || i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-400">
                  Question {i + 1}
                </p>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-gray-400">Your answer</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/student"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
