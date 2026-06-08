import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import ClassRoster from './ClassRoster';

vi.mock('../../api/teacher.js', () => ({
  listStudents: vi.fn(),
}));
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'teacher-1', name: 'Ms. Johnson' } }),
}));

import { listStudents } from '../../api/teacher.js';

function renderRoster() {
  return render(
    <MemoryRouter initialEntries={['/teacher/roster']}>
      <Routes>
        <Route path="/teacher/roster" element={<ClassRoster />} />
        <Route path="/teacher/students/:id" element={<p>Profile of student</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ClassRoster', () => {
  it('renders the list of students', async () => {
    listStudents.mockResolvedValue([
      { _id: 's1', name: 'Alex Rivera', email: 'alex@x.dev', overall_score: 88 },
      { _id: 's2', name: 'Priya Patel', email: 'priya@x.dev', overall_score: 62 },
    ]);

    renderRoster();

    expect(await screen.findByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Priya Patel')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
  });

  it('navigates to the student profile when a student is clicked', async () => {
    listStudents.mockResolvedValue([
      { _id: 's1', name: 'Alex Rivera', email: 'alex@x.dev', overall_score: 88 },
    ]);

    renderRoster();

    await userEvent.click(await screen.findByText('Alex Rivera'));
    expect(await screen.findByText('Profile of student')).toBeInTheDocument();
  });

  it('shows an empty state when there are no students', async () => {
    listStudents.mockResolvedValue([]);

    renderRoster();

    expect(await screen.findByText(/No students yet/i)).toBeInTheDocument();
  });
});
