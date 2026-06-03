// Small status pill for submission states (flagged / pending_approval / approved).
const STYLES = {
  flagged: 'bg-red-100 text-red-700',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-gray-100 text-gray-600'
};

export default function AlertBadge({ status = 'pending' }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status] || STYLES.pending}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
