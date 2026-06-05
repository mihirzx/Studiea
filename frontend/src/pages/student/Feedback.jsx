import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmission } from '../../api/submissions.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function scoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-500';
  return 'text-violet-600';
}

function scoreHeadline(score) {
  if (score >= 80) return 'Excellent work! 🌟';
  if (score >= 60) return "Good job — you're getting there! 💪";
  return 'Keep at it — every mistake is a lesson! 🚀';
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
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  // Hard guard: never show score/feedback before teacher approval
  if (!submission || submission.status !== 'approved') {
    return (
      <div className="min-h-screen bg-purple-50 p-6">
        <div className="mx-auto max-w-md text-center">
          <p className="mt-16 text-5xl">🕐</p>
          <h2 className="mt-4 text-xl font-bold text-violet-900">Almost there!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your teacher is reviewing this submission. Your work is in good hands — check back soon!
          </p>
          <Link
            to="/student"
            className="mt-6 inline-block rounded-lg bg-student-500 px-5 py-3 text-sm font-semibold text-white hover:bg-student-600"
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
    <div className="min-h-screen bg-purple-50 p-6">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Your Feedback"
          subtitle={submission.assignment_title}
          variant="student"
        />

        {/* Score display */}
        <div className="mb-8 rounded-2xl border border-purple-100 bg-white p-8 text-center shadow-sm">
          <p className={`text-7xl font-black transition-all ${scoreColor(score)}`}>
            {score}<span className="text-3xl">%</span>
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-800">{scoreHeadline(score)}</p>
          {submission.feedback && (
            <p className="mt-2 text-sm text-slate-500">{submission.feedback}</p>
          )}
        </div>

        {/* Weak areas */}
        {weakAreas.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-700">
              Let's work on these topics
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {weakAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
                >
                  {area}
                </span>
              ))}
            </div>
            <Link
              to="/student/study-buddy"
              className="text-sm font-semibold text-student-600 hover:underline"
            >
              Ask your Study Buddy about these →
            </Link>
          </div>
        )}

        {/* Per-question feedback */}
        {answers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-violet-700">
              Question by Question
            </h2>
            {answers.map((a, i) => (
              <div key={a.question_id || i} className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-400">
                  Question {i + 1}
                </p>
                <div className="rounded-lg bg-slate-50 p-3 mb-3">
                  <p className="text-xs font-semibold text-slate-400 mb-1">Your answer</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/student"
            className="inline-block rounded-lg border border-purple-200 px-5 py-2 text-sm font-semibold text-violet-700 hover:bg-purple-100"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
