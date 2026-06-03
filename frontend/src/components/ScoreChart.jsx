import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Renders a student's score_history. `data` = [{ date, score }].
// Alternatively, swap this for an embedded Hex dashboard iframe.
export default function ScoreChart({ data = [] }) {
  if (!data.length) return <p className="text-sm text-gray-500">No score history yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
