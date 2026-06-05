import { render, screen } from '@testing-library/react';
import AlertBadge from './AlertBadge';

describe('AlertBadge', () => {
  it('renders "flagged" status with red styles', () => {
    render(<AlertBadge status="flagged" />);
    const badge = screen.getByText('flagged');
    expect(badge).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('renders "pending_approval" with yellow styles and formatted text', () => {
    render(<AlertBadge status="pending_approval" />);
    const badge = screen.getByText('pending approval');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders "approved" with green styles', () => {
    render(<AlertBadge status="approved" />);
    const badge = screen.getByText('approved');
    expect(badge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('defaults to gray "pending" styles for unknown status', () => {
    render(<AlertBadge status="unknown" />);
    const badge = screen.getByText('unknown');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-600');
  });
});
