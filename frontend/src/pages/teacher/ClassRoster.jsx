import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { listStudents } from '../../api/teacher.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

function scoreClass(score) {
  if (score >= 80) return 'text-green-700 bg-green-50 ring-green-200 dark:text-green-300 dark:bg-green-950/40 dark:ring-green-900';
  if (score >= 60) return 'text-amber-700 bg-amber-50 ring-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:ring-amber-900';
  return 'text-red-700 bg-red-50 ring-red-200 dark:text-red-300 dark:bg-red-950/40 dark:ring-red-900';
}

function ClassRoster() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listStudents(user.id);
        if (!cancelled) setStudents(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError('Failed to load your class roster. Try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="p-6 text-sm text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Class Roster"
          subtitle={`${students.length} student${students.length !== 1 ? 's' : ''}`}
          variant="teacher"
        />

        {students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students yet"
            description="Students who register with your teacher ID will appear here."
          />
        ) : (
          <div className="space-y-2">
            {students.map((s) => (
              <button
                key={s._id}
                onClick={() => navigate(`/teacher/students/${s._id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teacher-50 text-sm font-bold text-teacher-700 dark:bg-teacher-900/40 dark:text-teacher-200">
                    {s.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">{s.name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${scoreClass(s.overall_score || 0)}`}>
                    {s.overall_score != null ? `${Math.round(s.overall_score)}%` : '—'}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-slate-600" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassRoster;
