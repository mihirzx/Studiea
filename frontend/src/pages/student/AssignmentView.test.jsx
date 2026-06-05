import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import AssignmentView from './AssignmentView';

vi.mock('../../api/assignments.js', () => ({
  getAssignment: vi.fn(),
}));
vi.mock('../../api/submissions.js', () => ({
  submitAnswers: vi.fn(),
  listStudentSubmissions: vi.fn(),
}));
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'student-1', name: 'Alex' } }),
}));

import { getAssignment } from '../../api/assignments.js';
import { submitAnswers, listStudentSubmissions } from '../../api/submissions.js';

const MOCK_ASSIGNMENT = {
  _id: 'assignment-1',
  title: 'Physics Quiz',
  subject: 'Physics',
  questions: [
    { question_id: 'q1', prompt: 'What is Newton\'s first law?' },
    { question_id: 'q2', prompt: 'Define velocity.' },
  ],
};

function renderView(assignmentId = 'assignment-1') {
  return render(
    <MemoryRouter initialEntries={[`/student/assignments/${assignmentId}`]}>
      <Routes>
        <Route path="/student/assignments/:id" element={<AssignmentView />} />
        <Route path="/student" element={<p>Dashboard</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AssignmentView — form validation', () => {
  it('shows already-submitted screen if a prior submission exists', async () => {
    getAssignment.mockResolvedValue(MOCK_ASSIGNMENT);
    listStudentSubmissions.mockResolvedValue([
      { _id: 'sub-1', assignment_id: 'assignment-1', status: 'pending' },
    ]);

    renderView();

    expect(await screen.findByText(/You already handed this in/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hand in/i })).not.toBeInTheDocument();
  });

  it('shows error when submitting with empty answers', async () => {
    getAssignment.mockResolvedValue(MOCK_ASSIGNMENT);
    listStudentSubmissions.mockResolvedValue([]);

    renderView();

    const submitBtn = await screen.findByRole('button', { name: /Hand in Assignment/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText(/Please answer all questions/i)).toBeInTheDocument();
    expect(submitAnswers).not.toHaveBeenCalled();
  });

  it('submits successfully when all answers are filled', async () => {
    getAssignment.mockResolvedValue(MOCK_ASSIGNMENT);
    listStudentSubmissions.mockResolvedValue([]);
    submitAnswers.mockResolvedValue({ _id: 'new-sub' });

    renderView();

    const textareas = await screen.findAllByPlaceholderText(/Write your answer here/i);
    await userEvent.type(textareas[0], 'An object at rest stays at rest');
    await userEvent.type(textareas[1], 'Velocity is speed with direction');

    await userEvent.click(screen.getByRole('button', { name: /Hand in Assignment/i }));

    expect(await screen.findByText(/Your answers are in/i)).toBeInTheDocument();
  });
});
