import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getAssignment } from '../../api/assignments.js';
import { submitAnswers, listStudentSubmissions } from '../../api/submissions.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function AssignmentView() {
  const { id } = useParams();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [assnData, subList] = await Promise.all([
          getAssignment(id),
          listStudentSubmissions(user.id),
        ]);
        if (cancelled) return;
        setAssignment(assnData);
        const existing = Array.isArray(subList) ? subList.find((s) => s.assignment_id === id) : null;
        setAlreadySubmitted(!!existing);
      } catch {
        if (!cancelled) setError('Failed to load the assignment. Try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, user.id]);

  function handleAnswerChange(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const allAnswered = assignment.questions.every((q) => answers[q.question_id]?.trim());
    if (!allAnswered) {
      setError('Please answer all questions before handing in.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formattedAnswers = assignment.questions.map((q) => ({
        question_id: q.question_id,
        answer: answers[q.question_id] || '',
      }));
      await submitAnswers(id, formattedAnswers);
      setHasSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (error && !assignment) return <p className="p-6 text-sm text-red-600">{error}</p>;

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <CheckCircle2 className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Already submitted</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your teacher is reviewing your answers. Check back soon to see your feedback.
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

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your answers are in!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your teacher will review them and you'll see your feedback soon.
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

  const questions = assignment?.questions ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title={assignment.title || 'Assignment'}
          subtitle={`${assignment.subject || ''} · ${questions.length} question${questions.length !== 1 ? 's' : ''}`}
          variant="student"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.question_id || i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-400">
                Question {i + 1} of {questions.length}
              </p>
              <p className="mb-3 text-sm font-medium text-gray-800">{q.prompt}</p>
              <textarea
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-student-500 focus:outline-none focus:ring-2 focus:ring-student-500/20"
                placeholder="Write your answer here…"
                value={answers[q.question_id] || ''}
                onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
              />
            </div>
          ))}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-student-500 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-student-600 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Handing in…' : 'Hand in Assignment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AssignmentView;
