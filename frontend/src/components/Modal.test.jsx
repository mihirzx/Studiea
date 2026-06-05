import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal', () => {
  it('does not render when open is false', () => {
    render(<Modal open={false} onClose={() => {}} title="Test"><p>Content</p></Modal>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders title and children when open is true', () => {
    render(<Modal open={true} onClose={() => {}} title="Confirm action"><p>Are you sure?</p></Modal>);
    expect(screen.getByText('Confirm action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders footer content when footer prop is provided', () => {
    render(
      <Modal open={true} onClose={() => {}} title="T" footer={<button>Confirm</button>}>
        <p>Body</p>
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<Modal open={true} onClose={handleClose} title="T"><p>Body</p></Modal>);
    await userEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
