import { render, screen } from '@testing-library/react';
import AlertBadge from './AlertBadge';

describe('AlertBadge', () => {
  it('renders "flagged" status with red styles', () => {
    render(<AlertBadge status="flagged" />);
    const badge = screen.getByText('Flagged');
    expect(badge).toHaveClass('bg-red-50', 'text-red-700');
  });

  it('renders "pending_approval" with yellow styles and formatted text', () => {
    render(<AlertBadge status="pending_approval" />);
    const badge = screen.getByText('Pending Approval');
    expect(badge).toHaveClass('bg-amber-50', 'text-amber-700');
  });

  it('renders "approved" with green styles', () => {
    render(<AlertBadge status="approved" />);
    const badge = screen.getByText('Approved');
    expect(badge).toHaveClass('bg-green-50', 'text-green-700');
  });

  it('defaults to gray "pending" styles for unknown status', () => {
    render(<AlertBadge status="unknown" />);
    const badge = screen.getByText('Pending');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-600');
  });
});
