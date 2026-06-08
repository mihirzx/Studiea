import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BarChart2, Bell, ClipboardList, Upload, CalendarDays } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getClassProgress } from '../../api/progress.js';
import { listTeacherAssignments } from '../../api/assignments.js';
import { getPendingAlerts } from '../../api/submissions.js';
import { listTeacherSessions } from '../../api/sessions.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import AlertBadge from '../../components/AlertBadge.jsx';
import ScoreChart from '../../components/ScoreChart.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import SessionCalendar from '../../components/SessionCalendar.jsx';

const DIFFICULTY_CHIP = {
  easy:   'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900',
  hard:   'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900',
};

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{value ?? '—'}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-teacher-50 p-2 dark:bg-teacher-900/40">
            <Icon className="h-5 w-5 text-teacher-700 dark:text-teacher-300" />
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
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [progress, assnList, alertList, sessionList] = await Promise.all([
          getClassProgress(user.id),
          listTeacherAssignments(user.id),
          getPendingAlerts(user.id),
          listTeacherSessions(user.id).catch(() => []),
        ]);
        if (cancelled) return;
        setClassProgress(progress);
        setAssignments(Array.isArray(assnList) ? assnList : []);
        setAlerts(Array.isArray(alertList) ? alertList : []);
        setSessions(Array.isArray(sessionList) ? sessionList : []);
      } catch {
        if (!cancelled) setError('Something went wrong. Try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="p-6 text-sm text-red-600 dark:text-red-400">{error}</p>;

  const avgScore = classProgress?.average_score ?? classProgress?.avg_score ?? null;
  const studentCount = classProgress?.student_count ?? classProgress?.students?.length ?? null;
  const scoreHistory = classProgress?.score_history ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
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
          <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 dark:border-amber-900 dark:bg-amber-950/40">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {alerts.length} submission{alerts.length !== 1 ? 's' : ''} waiting for your approval.
              </p>
            </div>
            <Link to="/teacher/alerts" className="text-sm font-semibold text-amber-900 hover:underline dark:text-amber-200">
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

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-teacher-700 dark:text-teacher-300" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                Session Calendar
              </h2>
            </div>
            <SessionCalendar
              sessions={sessions}
              onSelectDate={(date) => navigate(`/teacher/upload?date=${date}`)}
            />
            <p className="mt-3 text-xs text-gray-400 dark:text-slate-500">
              Pick a day to upload a session from that date. Dots mark days with a session.
            </p>
          </div>

          {scoreHistory.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                Class Score Trend
              </h2>
              <ScoreChart data={scoreHistory} color="#1d4ed8" />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Assignments</h2>
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
                  <tr className="border-b border-gray-100 text-left dark:border-slate-800">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Title</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Subject</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Difficulty</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Due Date</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr
                      key={a._id}
                      className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                      onClick={() => navigate(`/teacher/assignments/${a._id}`)}
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-slate-100">{a.title}</td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400">{a.subject}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_CHIP[a.difficulty] || 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {a.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400">
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
