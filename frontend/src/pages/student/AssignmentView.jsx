import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

        const existingSubmission = Array.isArray(subList)
          ? subList.find((s) => s.assignment_id === id)
          : null;
        setAlreadySubmitted(!!existingSubmission);
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

    const allAnswered = assignment.questions.every(
      (q) => answers[q.question_id]?.trim()
    );
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
      setError('Something went wrong submitting your answers. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (error && !assignment) return <p className="text-sm text-red-600">{error}</p>;

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-purple-50 p-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mt-12 text-5xl">📬</p>
          <h2 className="mt-4 text-xl font-bold text-violet-900">You already handed this in!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your teacher is reviewing your answers. You'll see your feedback once it's ready.
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

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-purple-50 p-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mt-12 text-6xl">🎉</p>
          <h2 className="mt-4 text-2xl font-bold text-violet-900">Your answers are in!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your teacher will review them and you'll see your feedback soon.
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

  const questions = assignment?.questions ?? [];
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title={assignment.title || 'Assignment'}
          subtitle={assignment.subject}
          variant="student"
        />

        <p className="mb-6 text-sm font-medium text-violet-600">
          {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} — take your time!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {questions.map((q, i) => (
            <div key={q.question_id || i} className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-violet-400">
                Question {i + 1} of {totalQuestions}
              </p>
              <p className="mb-3 text-sm font-medium text-slate-800">{q.prompt}</p>
              <textarea
                rows={4}
                className="w-full resize-none rounded-lg border border-purple-200 p-3 text-sm text-slate-800 placeholder-gray-300 focus:border-student-500 focus:outline-none"
                placeholder="Write your answer here…"
                value={answers[q.question_id] || ''}
                onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-student-500 py-4 text-base font-bold text-white hover:bg-student-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Handing in…' : 'Hand in Assignment ✓'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AssignmentView;
