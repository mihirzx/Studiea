import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import StudentDashboard from './StudentDashboard';

vi.mock('../../api/assignments.js', () => ({
  listStudentAssignments: vi.fn(),
}));
vi.mock('../../api/submissions.js', () => ({
  listStudentSubmissions: vi.fn(),
}));
vi.mock('../../api/progress.js', () => ({
  getProgress: vi.fn(),
}));
vi.mock('../../api/studyPlans.js', () => ({
  getActivePlan: vi.fn(),
}));
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'student-1', name: 'Alex' } }),
}));

import { listStudentAssignments } from '../../api/assignments.js';
import { listStudentSubmissions } from '../../api/submissions.js';
import { getProgress } from '../../api/progress.js';
import { getActivePlan } from '../../api/studyPlans.js';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <StudentDashboard />
    </MemoryRouter>
  );
}

describe('StudentDashboard — routing-critical', () => {
  beforeEach(() => {
    getProgress.mockResolvedValue(null);
    getActivePlan.mockResolvedValue(null);
  });

  it('links an approved assignment to /student/feedback/:submissionId (NOT assignmentId)', async () => {
    listStudentAssignments.mockResolvedValue([
      { _id: 'assignment-1', title: 'Physics Quiz', subject: 'Physics' },
    ]);
    listStudentSubmissions.mockResolvedValue([
      { _id: 'submission-99', assignment_id: 'assignment-1', status: 'approved' },
    ]);

    renderDashboard();

    const link = await screen.findByRole('link', { name: /View Feedback/i });
    expect(link).toHaveAttribute('href', '/student/feedback/submission-99');
    expect(link).not.toHaveAttribute('href', '/student/feedback/assignment-1');
  });

  it('shows "Start Assignment" link for unsubmitted assignments', async () => {
    listStudentAssignments.mockResolvedValue([
      { _id: 'assignment-2', title: 'Chemistry Homework', subject: 'Chemistry' },
    ]);
    listStudentSubmissions.mockResolvedValue([]);

    renderDashboard();

    const link = await screen.findByRole('link', { name: /Start Assignment/i });
    expect(link).toHaveAttribute('href', '/student/assignments/assignment-2');
  });

  it('shows holding text (no link) for submitted-but-not-approved assignment', async () => {
    listStudentAssignments.mockResolvedValue([
      { _id: 'assignment-3', title: 'Biology Lab', subject: 'Biology' },
    ]);
    listStudentSubmissions.mockResolvedValue([
      { _id: 'submission-50', assignment_id: 'assignment-3', status: 'pending' },
    ]);

    renderDashboard();

    expect(await screen.findByText(/Under review/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /View Feedback/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Start Assignment/i })).not.toBeInTheDocument();
  });
});
