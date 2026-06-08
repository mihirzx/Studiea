import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import StudentProfile from './StudentProfile';

vi.mock('../../api/teacher.js', () => ({
  getStudentStats: vi.fn(),
}));
vi.mock('../../api/assignments.js', () => ({
  listTeacherAssignments: vi.fn(),
}));
vi.mock('../../api/studyPlans.js', () => ({
  getActivePlan: vi.fn(),
}));
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'teacher-1', name: 'Ms. Johnson' } }),
}));

import { getStudentStats } from '../../api/teacher.js';
import { listTeacherAssignments } from '../../api/assignments.js';
import { getActivePlan } from '../../api/studyPlans.js';

const STATS = {
  student_name: 'Priya Patel',
  overall_score: 62,
  trend: 'declining',
  average: 62,
  counts: { pending: 0, flagged: 1, pending_approval: 0, approved: 1 },
  submission_count: 2,
  by_assignment: [],
  topic_mastery: [],
  weak_areas: [],
  score_history: [],
};

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/teacher/students/student-1']}>
      <Routes>
        <Route path="/teacher/students/:id" element={<StudentProfile />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('StudentProfile — stats + filters', () => {
  beforeEach(() => {
    getStudentStats.mockResolvedValue(STATS);
    listTeacherAssignments.mockResolvedValue([{ _id: 'a1', title: 'Physics Quiz' }]);
    getActivePlan.mockResolvedValue(null);
  });

  it('loads stats for the student on mount', async () => {
    renderProfile();
    expect(await screen.findByText('Priya Patel')).toBeInTheDocument();
    expect(getStudentStats).toHaveBeenCalledWith('teacher-1', 'student-1', expect.any(Object));
  });

  it('re-fetches stats with the assignment filter when changed', async () => {
    renderProfile();
    await screen.findByText('Priya Patel');
    getStudentStats.mockClear();

    await userEvent.selectOptions(screen.getByRole('combobox'), 'a1');

    await waitFor(() => expect(getStudentStats).toHaveBeenCalled());
    expect(getStudentStats).toHaveBeenLastCalledWith(
      'teacher-1',
      'student-1',
      expect.objectContaining({ assignment_id: 'a1' })
    );
  });
});
