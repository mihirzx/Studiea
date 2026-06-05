import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Nothing here" description="Add something to get started" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Add something to get started')).toBeInTheDocument();
  });

  it('renders action button when action prop is provided', () => {
    const handleClick = vi.fn();
    render(<EmptyState title="Empty" action={{ label: 'Add item', onClick: handleClick }} />);
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('does NOT render action button when action prop is omitted', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls action.onClick when button is clicked', async () => {
    const handleClick = vi.fn();
    render(<EmptyState title="Empty" action={{ label: 'Go', onClick: handleClick }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
