import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { listStudentAssignments } from '../../api/assignments.js';
import { listStudentSubmissions } from '../../api/submissions.js';
import { getProgress } from '../../api/progress.js';
import { getActivePlan } from '../../api/studyPlans.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ScoreChart from '../../components/ScoreChart.jsx';
import CornerDecor from '../../components/CornerDecor.jsx';
import MasteryBadge from '../../components/MasteryBadge.jsx'
import { listStudentBadges } from '../../api/badges.js';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatusDot({ status }) {
  if (status === 'approved') return <span className="h-2 w-2 rounded-full bg-green-500" />;
  if (status === 'flagged' || status === 'pending_approval') return <span className="h-2 w-2 rounded-full bg-amber-400" />;
  return <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-slate-600" />;
}

function StudentDashboard() {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [badges, setBadges] = useState([]);

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

  useEffect(() => {
    let cancelled = false; 
    listStudentBadges(user.id).then((data) => {
      if (!cancelled) setBadges(data);
    });
    return () => { cancelled = true; };
  }, [user.id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="p-6 text-sm text-red-600 dark:text-red-400">{error}</p>;

  const submissionByAssignment = submissions.reduce((acc, s) => {
    if (!acc[s.assignment_id]) acc[s.assignment_id] = s;
    return acc;
  }, {});

  const scoreHistory = progress?.score_history ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 p-6 dark:bg-slate-950">
      <CornerDecor />
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title={`${getGreeting()}, ${user.name?.split(' ')[0] || 'there'}`}
          variant="student"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
              Your Assignments
            </h2>

            {assignments.length === 0 ? (
              <EmptyState
                icon={BookOpen}
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
                      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate dark:text-slate-100">{a.title}</p>
                          <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                            {a.subject}{a.due_date ? ` · Due ${new Date(a.due_date).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                        {submission && <StatusDot status={submission.status} />}
                      </div>
                      <div className="mt-3">
                        {isApproved ? (
                          <Link
                            to={`/student/feedback/${submission._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-student-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-student-600"
                          >
                            View Feedback
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : isPending ? (
                          <p className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            Under review — check back soon
                          </p>
                        ) : (
                          <Link
                            to={`/student/assignments/${a._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-student-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-student-600"
                          >
                            Start Assignment
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {scoreHistory.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                  Your Progress
                </h2>
                <ScoreChart data={scoreHistory} color="#7c3aed" />
              </div>
            )}

            {plan?.daily_goal && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/40">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                  Today's Study Goal
                </h2>
                <p className="text-sm text-gray-700 dark:text-slate-300">{plan.daily_goal}</p>
                <Link
                  to="/student/study-buddy"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-student-600 hover:underline dark:text-student-400"
                >
                  Study with your Buddy
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* <div className="flex flex-wrap gap-2">
              {badges.length === 0
                ? <p className="text-sm text-gray-400 dark:text-slate-500">No badges yet.</p>
                : badges.map((b) => (
                  <MasteryBadge key={b.id} label={b.label} topic={b.topic} awardedAt={b.awarded_at}
                    onRemove={() => handleRemove(b.id)} />
                ))}
            </div> */}
            
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                Your Badges
              </h2>
              
              {badges.length === 0 ? (
                <p className = "text-sm text-gray-400 dark:text-slate-500">No badges yet, keep going!</p>) : (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((b) => <MasteryBadge key={b.id} label={b.label} topic={b.topic} awardedAt={b.awarded_at}/>)}
                  </div>
                )}
                
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
