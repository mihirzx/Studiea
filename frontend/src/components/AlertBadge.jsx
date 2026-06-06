const STATUS_CONFIG = {
  flagged:          { label: 'Flagged',          className: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
  pending_approval: { label: 'Pending Approval',  className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  approved:         { label: 'Approved',           className: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
  pending:          { label: 'Pending',            className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200' },
};

function AlertBadge({ status = 'pending' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export default AlertBadge;
