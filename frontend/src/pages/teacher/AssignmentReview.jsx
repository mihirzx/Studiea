import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { getAssignment, updateAssignment } from '../../api/assignments.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const DIFFICULTY_CHIP = {
  easy:   'bg-green-50 text-green-700 ring-1 ring-green-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  hard:   'bg-red-50 text-red-700 ring-1 ring-red-200',
};

function AssignmentReview() {
  const { id } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
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
        setQuestions(Array.isArray(data.questions) ? data.questions.map((q) => ({ ...q })) : []);
        if (data.questions?.length > 0) setExpandedIndex(0);
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
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
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
  if (error && !assignment) return <p className="p-6 text-sm text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <PageHeader title={assignment.title || 'Review Assignment'} variant="teacher">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teacher-800 disabled:opacity-60"
          >
            {isSaved ? (
              <><Check className="h-4 w-4" /> Saved</>
            ) : isSaving ? (
              'Saving…'
            ) : (
              'Save Changes'
            )}
          </button>
        </PageHeader>

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          {assignment.subject && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {assignment.subject}
            </span>
          )}
          {assignment.difficulty && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${DIFFICULTY_CHIP[assignment.difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {assignment.difficulty}
            </span>
          )}
          {assignment.due_date && (
            <span className="text-xs text-gray-400">
              Due {new Date(assignment.due_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        )}

        <div className="space-y-3">
          {questions.map((q, i) => {
            const isOpen = expandedIndex === i;
            return (
              <div
                key={q.question_id || i}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm border-l-4 border-l-teacher-700"
              >
                <button
                  onClick={() => setExpandedIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Question {i + 1}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                      {q.prompt || 'No prompt yet'}
                    </p>
                  </div>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                    : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-50 px-5 py-4 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                        Question prompt
                      </label>
                      <textarea
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-teacher-700 focus:outline-none focus:ring-2 focus:ring-teacher-700/20"
                        value={q.prompt || ''}
                        onChange={(e) => handleQuestionChange(i, 'prompt', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                        Expected answer{' '}
                        <span className="font-normal text-gray-400">(teacher only — not shown to students)</span>
                      </label>
                      <textarea
                        rows={2}
                        className="w-full resize-none rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm text-gray-800 focus:border-teacher-700 focus:outline-none focus:ring-2 focus:ring-teacher-700/20"
                        value={q.expected_answer || ''}
                        onChange={(e) => handleQuestionChange(i, 'expected_answer', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-gray-500">Points</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teacher-700 focus:outline-none focus:ring-2 focus:ring-teacher-700/20"
                        value={q.points ?? ''}
                        onChange={(e) => handleQuestionChange(i, 'points', Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {questions.length === 0 && (
          <p className="mt-6 text-center text-sm text-gray-400">No questions found for this assignment.</p>
        )}
      </div>
    </div>
  );
}

export default AssignmentReview;
