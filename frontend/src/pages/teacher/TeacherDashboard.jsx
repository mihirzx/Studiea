import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BarChart2, Bell, ClipboardList, Upload } from 'lucide-react';
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
  easy:   'bg-green-50 text-green-700 ring-1 ring-green-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  hard:   'bg-red-50 text-red-700 ring-1 ring-red-200',
};

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value ?? '—'}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-teacher-50 p-2">
            <Icon className="h-5 w-5 text-teacher-700" />
          </div>
        )}
      </div>
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
  if (error) return <p className="p-6 text-sm text-red-600">{error}</p>;

  const avgScore = classProgress?.average_score ?? classProgress?.avg_score ?? null;
  const studentCount = classProgress?.student_count ?? classProgress?.students?.length ?? null;
  const scoreHistory = classProgress?.score_history ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Class Overview"
          subtitle={user.name ? `Welcome back, ${user.name}` : undefined}
          variant="teacher"
        >
          <Link
            to="/teacher/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teacher-800"
          >
            <Upload className="h-4 w-4" />
            Upload Session
          </Link>
        </PageHeader>

        {alerts.length > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                {alerts.length} submission{alerts.length !== 1 ? 's' : ''} waiting for your approval.
              </p>
            </div>
            <Link to="/teacher/alerts" className="text-sm font-semibold text-amber-900 hover:underline">
              Review now
            </Link>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Students" value={studentCount} icon={Users} />
          <StatCard
            label="Class Average"
            value={avgScore != null ? `${Math.round(avgScore)}%` : null}
            icon={BarChart2}
          />
          <StatCard
            label="Pending Alerts"
            value={alerts.length}
            icon={Bell}
            accent={alerts.length > 0 ? 'border-l-4 border-l-red-500' : ''}
          />
        </div>

        {scoreHistory.length > 0 && (
          <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Class Score Trend
            </h2>
            <ScoreChart data={scoreHistory} />
          </div>
        )}

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Assignments</h2>
          </div>

          {assignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No assignments yet"
              description="Upload a class session to generate your first assignment."
              action={{ label: 'Upload Session', onClick: () => navigate('/teacher/upload') }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Title</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Subject</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Difficulty</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Due Date</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr
                      key={a._id}
                      className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-slate-50"
                      onClick={() => navigate(`/teacher/assignments/${a._id}`)}
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-900">{a.title}</td>
                      <td className="px-5 py-3.5 text-gray-500">{a.subject}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_CHIP[a.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                          {a.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3.5">
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
