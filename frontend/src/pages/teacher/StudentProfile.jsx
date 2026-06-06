import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';
import { getProgress } from '../../api/progress.js';
import { listStudentSubmissions } from '../../api/submissions.js';
import { getActivePlan } from '../../api/studyPlans.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import AlertBadge from '../../components/AlertBadge.jsx';
import ScoreChart from '../../components/ScoreChart.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const TREND_CONFIG = {
  improving: { label: 'Improving',  Icon: TrendingUp,   className: 'text-green-700 bg-green-50 ring-1 ring-green-200' },
  declining:  { label: 'Declining',  Icon: TrendingDown, className: 'text-red-700 bg-red-50 ring-1 ring-red-200' },
  stable:     { label: 'Stable',     Icon: Minus,        className: 'text-gray-600 bg-gray-100 ring-1 ring-gray-200' },
};

function StudentProfile() {
  const { id } = useParams();

  const [progress, setProgress] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [prog, subs, activePlan] = await Promise.all([
          getProgress(id),
          listStudentSubmissions(id),
          getActivePlan(id).catch(() => null),
        ]);
        if (cancelled) return;
        setProgress(prog);
        setSubmissions(Array.isArray(subs) ? subs : []);
        setPlan(activePlan);
      } catch {
        if (!cancelled) setError('Failed to load student profile. Try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="p-6 text-sm text-red-600">{error}</p>;

  const studentName = progress?.student_name || submissions[0]?.student_name || 'Student';
  const overallScore = progress?.overall_score ?? null;
  const scoreHistory = progress?.score_history ?? [];
  const topicMastery = progress?.topic_mastery ?? [];
  const trendConfig = TREND_CONFIG[progress?.trend];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <PageHeader title={studentName} subtitle="Student profile" variant="teacher">
          <div className="flex items-center gap-2">
            {overallScore != null && (
              <span className="rounded-full bg-teacher-50 px-4 py-1.5 text-sm font-bold text-teacher-700 ring-1 ring-teacher-100">
                {Math.round(overallScore)}% overall
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

        {scoreHistory.length > 0 && (
          <div className="mb-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Score History
            </h2>
            <ScoreChart data={scoreHistory} />
          </div>
        )}

        {topicMastery.length > 0 && (
          <div className="mb-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Topic Mastery
            </h2>
            <div className="space-y-3">
              {topicMastery.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-gray-600">
                    <span>{t.topic}</span>
                    <span className="text-gray-400">{t.mastery_score}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-teacher-700 transition-all"
                      style={{ width: `${t.mastery_score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {plan && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Active Study Plan
            </h2>
            <p className="text-sm text-gray-700">{plan.daily_goal}</p>
            {plan.weak_areas?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {plan.weak_areas.map((area) => (
                  <span key={area} className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800">
                    {area}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs italic text-gray-400">
              Chat history is private to the student.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-50 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Submissions</h2>
          </div>
          {submissions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No submissions yet"
              description="This student hasn't submitted any assignments."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Assignment</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Score</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s._id} className="border-b border-gray-50">
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        {s.assignment_title || s.assignment_id}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-700">
                        {s.status === 'approved' && s.score != null ? `${s.score}%` : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <AlertBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-400">
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
