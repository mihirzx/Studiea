import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import AssignmentReview from './AssignmentReview';

vi.mock('../../api/assignments.js', () => ({
  getAssignment: vi.fn(),
  updateAssignment: vi.fn(),
}));

import { getAssignment, updateAssignment } from '../../api/assignments.js';

const ASSIGNMENT = {
  _id: 'assignment-1',
  title: 'Newton\'s Laws Quiz',
  subject: 'Physics',
  difficulty: 'medium',
  teaching_directive: '',
  questions: [
    { question_id: 'q1', prompt: 'State the first law.', expected_answer: '...', points: 50 },
  ],
};

function renderReview() {
  return render(
    <MemoryRouter initialEntries={['/teacher/assignments/assignment-1']}>
      <Routes>
        <Route path="/teacher/assignments/:id" element={<AssignmentReview />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AssignmentReview — teaching directive', () => {
  beforeEach(() => {
    getAssignment.mockResolvedValue(ASSIGNMENT);
    updateAssignment.mockResolvedValue({ success: true });
  });

  it('saves the teaching directive in the patch', async () => {
    renderReview();

    const directive = await screen.findByLabelText(/Teaching directive/i);
    await userEvent.type(directive, 'Be extra encouraging.');
    await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => expect(updateAssignment).toHaveBeenCalled());
    expect(updateAssignment).toHaveBeenCalledWith(
      'assignment-1',
      expect.objectContaining({ teaching_directive: 'Be extra encouraging.' })
    );
  });

  it('seeds the directive field from the existing assignment', async () => {
    getAssignment.mockResolvedValue({ ...ASSIGNMENT, teaching_directive: 'Use sports analogies.' });
    renderReview();
    expect(await screen.findByDisplayValue('Use sports analogies.')).toBeInTheDocument();
  });
});
