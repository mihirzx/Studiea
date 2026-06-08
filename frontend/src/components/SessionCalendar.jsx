import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Local-time YYYY-MM-DD key (avoids UTC off-by-one from toISOString).
function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// A clickable month grid. Days with a session get a dot; clicking any day calls
// onSelectDate('YYYY-MM-DD'). No external date library.
function SessionCalendar({ sessions = [], onSelectDate }) {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const sessionDays = new Set(
    sessions
      .filter((s) => s.recorded_at)
      .map((s) => toDateKey(new Date(s.recorded_at)))
  );
  const todayKey = toDateKey(today);

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function changeMonth(delta) {
    setView((v) => {
      const m = v.month + delta;
      if (m < 0) return { year: v.year - 1, month: 11 };
      if (m > 11) return { year: v.year + 1, month: 0 };
      return { ...v, month: m };
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
          {MONTHS[view.month]} {view.year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeMonth(-1)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-xs font-semibold text-gray-400 dark:text-slate-500">
            {w}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const key = toDateKey(new Date(view.year, view.month, day));
          const hasSession = sessionDays.has(key);
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              onClick={() => onSelectDate?.(key)}
              className={`relative flex h-9 items-center justify-center rounded-lg text-sm transition-colors hover:bg-teacher-50 hover:text-teacher-700 dark:hover:bg-slate-800 dark:hover:text-teacher-200 ${
                isToday
                  ? 'font-bold text-teacher-700 ring-1 ring-teacher-200 dark:text-teacher-300 dark:ring-teacher-800'
                  : 'text-gray-700 dark:text-slate-300'
              }`}
            >
              {day}
              {hasSession && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-teacher-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SessionCalendar;
