import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAssignment, updateAssignment } from '../../api/assignments.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const DIFFICULTY_CHIP = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-800',
  hard:   'bg-red-100 text-red-700',
};

function AssignmentReview() {
  const { id } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const savedTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAssignment(id);
        if (cancelled) return;
        setAssignment(data);
        setQuestions(
          Array.isArray(data.questions)
            ? data.questions.map((q) => ({ ...q }))
            : []
        );
      } catch {
        if (!cancelled) setError('Failed to load assignment. Try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(savedTimerRef.current);
    };
  }, [id]);

  function handleQuestionChange(index, field, value) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
    setIsSaved(false);
  }

  async function handleSave() {
    setIsSaving(true);
    setError('');
    try {
      await updateAssignment(id, { questions });
      setIsSaved(true);
      savedTimerRef.current = setTimeout(() => setIsSaved(false), 2000);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (error && !assignment) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <PageHeader title={assignment.title || 'Review Assignment'} variant="teacher">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teacher-800 disabled:opacity-60"
          >
            {isSaved ? 'Saved ✓' : isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </PageHeader>

        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          {assignment.subject && (
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              {assignment.subject}
            </span>
          )}
          {assignment.difficulty && (
            <span className={`rounded-full px-3 py-1 font-medium ${DIFFICULTY_CHIP[assignment.difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {assignment.difficulty}
            </span>
          )}
          {assignment.due_date && (
            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
          )}
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div
              key={q.question_id || i}
              className="rounded-xl border border-slate-200 bg-white shadow-sm border-l-4 border-l-teacher-700"
            >
              <div className="px-5 pt-4 pb-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                  Question {i + 1}
                </p>
              </div>

              <div className="px-5 pb-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Question prompt
                  </label>
                  <textarea
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-teacher-600 focus:outline-none"
                    value={q.prompt || ''}
                    onChange={(e) => handleQuestionChange(i, 'prompt', e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Expected answer <span className="font-normal text-slate-400">(teacher only)</span>
                  </label>
                  <textarea
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-teacher-600 focus:outline-none"
                    value={q.expected_answer || ''}
                    onChange={(e) => handleQuestionChange(i, 'expected_answer', e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-600">Points</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 rounded-lg border border-slate-200 p-2 text-sm text-slate-800 focus:border-teacher-600 focus:outline-none"
                    value={q.points ?? ''}
                    onChange={(e) => handleQuestionChange(i, 'points', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <p className="mt-6 text-center text-sm text-slate-400">No questions found for this assignment.</p>
        )}
      </div>
    </div>
  );
}

export default AssignmentReview;
