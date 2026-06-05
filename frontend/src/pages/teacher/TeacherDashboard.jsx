import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getClassProgress } from '../../api/progress.js';
import { listTeacherAssignments } from '../../api/assignments.js';
import { getPendingAlerts } from '../../api/submissions.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import AlertBadge from '../../components/AlertBadge.jsx';
import ScoreChart from '../../components/ScoreChart.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const DIFFICULTY_CHIP = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-800',
  hard:   'bg-red-100 text-red-700',
};

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${accent}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value ?? '—'}</p>
    </div>
  );
}

function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classProgress, setClassProgress] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [progress, assnList, alertList] = await Promise.all([
          getClassProgress(user.id),
          listTeacherAssignments(user.id),
          getPendingAlerts(user.id),
        ]);
        if (cancelled) return;
        setClassProgress(progress);
        setAssignments(Array.isArray(assnList) ? assnList : []);
        setAlerts(Array.isArray(alertList) ? alertList : []);
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

  const avgScore = classProgress?.average_score ?? classProgress?.avg_score ?? null;
  const studentCount = classProgress?.student_count ?? classProgress?.students?.length ?? null;
  const scoreHistory = classProgress?.score_history ?? [];

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Class Overview"
          subtitle={user.name ? `Welcome back, ${user.name}` : undefined}
          variant="teacher"
        >
          <Link
            to="/teacher/upload"
            className="rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teacher-800"
          >
            + Upload Session
          </Link>
        </PageHeader>

        {alerts.length > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3">
            <p className="text-sm font-medium text-yellow-800">
              {alerts.length} submission{alerts.length !== 1 ? 's' : ''} waiting for your approval.
            </p>
            <Link to="/teacher/alerts" className="text-sm font-semibold text-yellow-900 hover:underline">
              Review now →
            </Link>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Students" value={studentCount} />
          <StatCard
            label="Class Average"
            value={avgScore != null ? `${Math.round(avgScore)}%` : null}
          />
          <StatCard
            label="Pending Alerts"
            value={alerts.length}
            accent={alerts.length > 0 ? 'border-l-4 border-l-red-500' : ''}
          />
        </div>

        {scoreHistory.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Class Score Trend
            </h2>
            <ScoreChart data={scoreHistory} />
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Assignments</h2>
          </div>

          {assignments.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No assignments yet"
              description="Upload a class session and generate the first assignment."
              action={{ label: 'Upload Session', onClick: () => navigate('/teacher/upload') }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Difficulty</th>
                    <th className="px-5 py-3">Due Date</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr
                      key={a._id}
                      className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/teacher/assignments/${a._id}`)}
                    >
                      <td className="px-5 py-3 font-medium text-slate-900">{a.title}</td>
                      <td className="px-5 py-3 text-slate-600">{a.subject}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_CHIP[a.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                          {a.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <AlertBadge status={a.status || 'pending'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
