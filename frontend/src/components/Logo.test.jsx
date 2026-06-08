import { render, screen } from '@testing-library/react';
import Logo from './Logo';

describe('Logo', () => {
  it('renders the wordmark by default', () => {
    render(<Logo />);
    expect(screen.getByText('Studiea')).toBeInTheDocument();
  });

  it('applies the purple class for the student variant', () => {
    const { container } = render(<Logo variant="student" />);
    expect(container.firstChild).toHaveClass('text-student-600');
  });

  it('applies the blue class for the teacher variant', () => {
    const { container } = render(<Logo variant="teacher" />);
    expect(container.firstChild).toHaveClass('text-teacher-700');
  });

  it('hides the wordmark when showWordmark is false', () => {
    render(<Logo showWordmark={false} />);
    expect(screen.queryByText('Studiea')).not.toBeInTheDocument();
  });
});
