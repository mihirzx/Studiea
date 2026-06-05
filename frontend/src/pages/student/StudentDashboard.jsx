import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { listStudentAssignments } from '../../api/assignments.js';
import { listStudentSubmissions } from '../../api/submissions.js';
import { getProgress } from '../../api/progress.js';
import { getActivePlan } from '../../api/studyPlans.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ScoreChart from '../../components/ScoreChart.jsx';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StudentDashboard() {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [assnList, subList, prog, activePlan] = await Promise.all([
          listStudentAssignments(user.id),
          listStudentSubmissions(user.id),
          getProgress(user.id).catch(() => null),
          getActivePlan(user.id).catch(() => null),
        ]);
        if (cancelled) return;
        setAssignments(Array.isArray(assnList) ? assnList : []);
        setSubmissions(Array.isArray(subList) ? subList : []);
        setProgress(prog);
        setPlan(activePlan);
      } catch {
        if (!cancelled) setError('Something went wrong. Try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  // Build a lookup: assignment_id → approved submission (for feedback links)
  const submissionByAssignment = submissions.reduce((acc, s) => {
    if (!acc[s.assignment_id]) acc[s.assignment_id] = s;
    return acc;
  }, {});

  const scoreHistory = progress?.score_history ?? [];

  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title={`${getGreeting()}, ${user.name?.split(' ')[0] || 'there'}! 🌟`}
          variant="student"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Assignments column */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-violet-700">
              Your Assignments
            </h2>

            {assignments.length === 0 ? (
              <EmptyState
                icon="📚"
                title="No assignments yet"
                description="Check back soon — your teacher will post one after the next lesson."
              />
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => {
                  const submission = submissionByAssignment[a._id];
                  const isApproved = submission?.status === 'approved';
                  const isPending = submission && !isApproved;

                  return (
                    <div
                      key={a._id}
                      className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm"
                    >
                      <p className="font-semibold text-violet-900">{a.title}</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {a.subject} {a.due_date ? `· Due ${new Date(a.due_date).toLocaleDateString()}` : ''}
                      </p>
                      <div className="mt-3">
                        {isApproved ? (
                          <Link
                            to={`/student/feedback/${submission._id}`}
                            className="inline-block rounded-lg bg-student-500 px-4 py-2 text-sm font-semibold text-white hover:bg-student-600"
                          >
                            View Feedback →
                          </Link>
                        ) : isPending ? (
                          <p className="text-sm text-gray-500 italic">
                            Your teacher is reviewing this — check back soon! ⏳
                          </p>
                        ) : (
                          <Link
                            to={`/student/assignments/${a._id}`}
                            className="inline-block rounded-lg bg-student-500 px-4 py-2 text-sm font-semibold text-white hover:bg-student-600"
                          >
                            Start Assignment →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Progress + plan column */}
          <div className="space-y-4">
            {scoreHistory.length > 0 && (
              <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-violet-700">
                  Your Progress
                </h2>
                <ScoreChart data={scoreHistory} />
              </div>
            )}

            {plan?.daily_goal && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">
                  Today's Study Goal
                </h2>
                <p className="text-sm text-slate-700">{plan.daily_goal}</p>
                <Link
                  to="/student/study-buddy"
                  className="mt-3 inline-block text-sm font-semibold text-student-600 hover:underline"
                >
                  Study with your Buddy →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
