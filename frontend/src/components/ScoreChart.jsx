import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Format an ISO date into a short, human-readable label (e.g. "Jun 5").
// Falls back to the raw value if it isn't a parseable date.
function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Renders a student's score_history. `data` = [{ date, score }].
// `color` themes the line (student violet vs teacher blue).
export default function ScoreChart({ data = [], color = '#4f46e5' }) {
  if (!data.length) return <p className="text-sm text-gray-500">No score history yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          labelFormatter={formatDate}
          formatter={(value) => [`${value}%`, 'Score']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
        />
        <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
