import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getStudentStats } from '../../api/teacher.js';
import { listTeacherAssignments } from '../../api/assignments.js';
import { getActivePlan } from '../../api/studyPlans.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import AlertBadge from '../../components/AlertBadge.jsx';
import ScoreChart from '../../components/ScoreChart.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import MasteryBadge from '../../components/MasteryBadge.jsx';
import { listStudentBadges, awardBadge, removeBadge } from '../../api/badges.js';


const TREND_CONFIG = {
  improving: { label: 'Improving', Icon: TrendingUp, className: 'text-green-700 bg-green-50 ring-1 ring-green-200 dark:text-green-300 dark:bg-green-950/40 dark:ring-green-900' },
  declining: { label: 'Declining', Icon: TrendingDown, className: 'text-red-700 bg-red-50 ring-1 ring-red-200 dark:text-red-300 dark:bg-red-950/40 dark:ring-red-900' },
  stable: { label: 'Stable', Icon: Minus, className: 'text-gray-600 bg-gray-100 ring-1 ring-gray-200 dark:text-slate-300 dark:bg-slate-800 dark:ring-slate-700' },
};

const EMPTY_FILTERS = { from: '', to: '', assignment_id: '' };

const filterFieldClass =
  'w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm text-gray-800 ' +
  'focus:border-teacher-700 focus:outline-none focus:ring-2 focus:ring-teacher-700/20 ' +
  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [plan, setPlan] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [topicQuery, setTopicQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [badges, setBadges] = useState([]);
  const [topic, setTopic] = useState('');
  const [customLabel, setCustomLabel] = useState('');


  // Assignments (for the filter dropdown) + active plan — fetched once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [assnList, activePlan] = await Promise.all([
        listTeacherAssignments(user.id).catch(() => []),
        getActivePlan(id).catch(() => null),
      ]);
      if (cancelled) return;
      setAssignments(Array.isArray(assnList) ? assnList : []);
      setPlan(activePlan);
    })();
    return () => { cancelled = true; };
  }, [user.id, id]);

  // Stats — re-fetched whenever a server-side filter changes.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const data = await getStudentStats(user.id, id, filters);
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setError('Failed to load student stats. Try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id, id, filters]);

  // The badge stuffs
  useEffect(() => {
    let cancelled = false;
    listStudentBadges(id).then((data) => { if (!cancelled) setBadges(data) });
    return () => { cancelled = true; };
  }, [id])

 


  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  // Award a badge: build the label (custom text wins, else "Mastered: <topic>"),
  // save it, then optimistically prepend it to the list and reset the form.
  async function handleAward(e) {
    e.preventDefault();
    const finalLabel = customLabel.trim() || (topic ? `Mastered: ${topic}` : '');
    if (!finalLabel) return;
    const badge = await awardBadge(id, { label: finalLabel, topic: topic || null });
    setBadges((prev) => [badge, ...prev]);
    setTopic('');
    setCustomLabel('');
  }

  async function handleRemove(badgeId) {
    await removeBadge(id, badgeId);
    setBadges((prev) => prev.filter((b) => b.id !== badgeId));
  }

  if (isLoading && !stats) return <LoadingSpinner />;
  if (error) return <p className="p-6 text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!stats) return null;

  const trendConfig = TREND_CONFIG[stats.trend];
  const counts = stats.counts || {};
  const byAssignment = stats.by_assignment || [];
  const weakAreas = stats.weak_areas || [];
  const scoreHistory = stats.score_history || [];
  const topicMastery = (stats.topic_mastery || []).filter((t) =>
    topicQuery ? t.topic?.toLowerCase().includes(topicQuery.toLowerCase()) : true
  );
  const hasFilters = filters.from || filters.to || filters.assignment_id;

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">
        <PageHeader title={stats.student_name || 'Student'} subtitle="Student profile" variant="teacher">
          <div className="flex items-center gap-2">
            {stats.overall_score != null && (
              <span className="rounded-full bg-teacher-50 px-4 py-1.5 text-sm font-bold text-teacher-700 ring-1 ring-teacher-100 dark:bg-teacher-900/40 dark:text-teacher-200 dark:ring-teacher-800">
                {Math.round(stats.overall_score)}% overall
              </span>
            )}
            {trendConfig && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${trendConfig.className}`}>
                <trendConfig.Icon className="h-3.5 w-3.5" />
                {trendConfig.label}
              </span>
            )}
          </div>
        </PageHeader>

        {/* Filters */}
        <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-slate-400">From</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilter('from', e.target.value)}
                className={`${filterFieldClass} dark:[color-scheme:dark]`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-slate-400">To</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilter('to', e.target.value)}
                className={`${filterFieldClass} dark:[color-scheme:dark]`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-slate-400">Assignment</label>
              <select
                value={filters.assignment_id}
                onChange={(e) => setFilter('assignment_id', e.target.value)}
                className={filterFieldClass}
              >
                <option value="">All</option>
                {assignments.map((a) => (
                  <option key={a._id} value={a._id}>{a.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-slate-400">Topic</label>
              <input
                type="text"
                value={topicQuery}
                onChange={(e) => setTopicQuery(e.target.value)}
                placeholder="Filter mastery…"
                className={`${filterFieldClass} placeholder-gray-300 dark:placeholder-slate-500`}
              />
            </div>
          </div>
          {(hasFilters || topicQuery) && (
            <button
              onClick={() => { setFilters(EMPTY_FILTERS); setTopicQuery(''); }}
              className="mt-3 text-xs font-semibold text-teacher-700 hover:underline dark:text-teacher-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Summary tiles */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Avg Score" value={stats.average != null ? `${stats.average}%` : '—'} />
          <StatTile label="Submissions" value={stats.submission_count ?? 0} />
          <StatTile label="Approved" value={counts.approved ?? 0} />
          <StatTile label="Needs Review" value={(counts.flagged ?? 0) + (counts.pending_approval ?? 0)} />
        </div>

        {scoreHistory.length > 0 && (
          <div className="mb-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Score History</h2>
            <ScoreChart data={scoreHistory} color="#1d4ed8" />
          </div>
        )}

        {topicMastery.length > 0 && (
          <div className="mb-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Topic Mastery</h2>
            <div className="space-y-3">
              {topicMastery.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-gray-600 dark:text-slate-300">
                    <span>{t.topic}</span>
                    <span className="text-gray-400 dark:text-slate-500">{t.mastery_score}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                    <div className="h-1.5 rounded-full bg-teacher-700 transition-all dark:bg-teacher-500" style={{ width: `${t.mastery_score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {weakAreas.length > 0 && (
          <div className="mb-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Weak Areas</h2>
            <div className="flex flex-wrap gap-2">
              {weakAreas.map((w) => (
                <span key={w.area} className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900">
                  {w.area}
                  <span className="rounded-full bg-amber-200 px-1.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200">{w.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {plan && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Active Study Plan</h2>
            <p className="text-sm text-gray-700 dark:text-slate-300">{plan.daily_goal}</p>
            <p className="mt-3 text-xs italic text-gray-400 dark:text-slate-500">Chat history is private to the student.</p>
          </div>
        )}

        <div className="mb-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Achievements</h2>

          <div className="mb-4 flex flex-wrap gap-2">
            {badges.length === 0
              ? <p className="text-sm text-gray-400 dark:text-slate-500">No badges yet.</p>
              : badges.map((b) => (
                <MasteryBadge key={b.id} label={b.label} topic={b.topic} awardedAt={b.awarded_at}
                  onRemove={() => handleRemove(b.id)} />
              ))}
          </div>

          <form onSubmit={handleAward} className="flex flex-wrap items-center gap-2">
            <select value={topic} onChange={(e) => setTopic(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <option value="">Pick a topic…</option>
              {(stats.topic_mastery || []).map((t) => (
                <option key={t.topic} value={t.topic}>{t.topic}</option>
              ))}
            </select>
            <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="…or a custom label"
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
            <button type="submit" className="rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teacher-800">
              Award
            </button>
          </form>
        </div>


        <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-gray-50 px-5 py-4 dark:border-slate-800">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Submissions</h2>
          </div>
          {byAssignment.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No submissions"
              description={hasFilters ? 'No submissions match these filters.' : "This student hasn't submitted any assignments."}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 text-left dark:border-slate-800">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Assignment</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Score</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {byAssignment.map((s, i) => (
                    <tr key={`${s.assignment_id}-${i}`} className="border-b border-gray-50 dark:border-slate-800">
                      <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-slate-200">{s.title || s.assignment_id}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-700 dark:text-slate-300">
                        {s.status === 'approved' && s.score != null ? `${s.score}%` : '—'}
                      </td>
                      <td className="px-5 py-3.5"><AlertBadge status={s.status} /></td>
                      <td className="px-5 py-3.5 text-gray-400 dark:text-slate-500">
                        {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}
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

export default StudentProfile;
