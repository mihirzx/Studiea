import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProgress } from '../../api/progress.js';
import { listStudentSubmissions } from '../../api/submissions.js';
import { getActivePlan } from '../../api/studyPlans.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import AlertBadge from '../../components/AlertBadge.jsx';
import ScoreChart from '../../components/ScoreChart.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const TREND_DISPLAY = {
  improving: { label: 'Improving ↑', className: 'text-green-700 bg-green-50' },
  declining:  { label: 'Declining ↓', className: 'text-red-700 bg-red-50' },
  stable:     { label: 'Stable →',    className: 'text-gray-700 bg-gray-100' },
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
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const studentName = progress?.student_name || submissions[0]?.student_name || 'Student';
  const overallScore = progress?.overall_score ?? null;
  const scoreHistory = progress?.score_history ?? [];
  const topicMastery = progress?.topic_mastery ?? [];
  const trend = progress?.trend;
  const trendDisplay = TREND_DISPLAY[trend];

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title={studentName}
          subtitle="Individual student view"
          variant="teacher"
        >
          {overallScore != null && (
            <span className="rounded-full bg-teacher-100 px-4 py-1.5 text-sm font-bold text-teacher-700">
              Overall: {Math.round(overallScore)}%
            </span>
          )}
          {trendDisplay && (
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${trendDisplay.className}`}>
              {trendDisplay.label}
            </span>
          )}
        </PageHeader>

        {/* Score Chart */}
        {scoreHistory.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Score History
            </h2>
            <ScoreChart data={scoreHistory} />
          </div>
        )}

        {/* Topic Mastery */}
        {topicMastery.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Topic Mastery
            </h2>
            <div className="space-y-3">
              {topicMastery.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
                    <span>{t.topic}</span>
                    <span>{t.mastery_score}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-teacher-700 transition-all"
                      style={{ width: `${t.mastery_score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Study Plan */}
        {plan && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-700">
              Active Study Plan
            </h2>
            <p className="text-sm text-slate-700">{plan.daily_goal}</p>
            {plan.weak_areas?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.weak_areas.map((area) => (
                  <span key={area} className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800">
                    {area}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400 italic">
              Chat history is private to the student.
            </p>
          </div>
        )}

        {/* Submissions Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Submissions
            </h2>
          </div>
          {submissions.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No submissions yet"
              description="This student hasn't submitted any assignments."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Assignment</th>
                    <th className="px-5 py-3">Score</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s._id} className="border-b border-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {s.assignment_title || s.assignment_id}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {s.status === 'approved' && s.score != null
                          ? `${s.score}%`
                          : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <AlertBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3 text-slate-500">
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
