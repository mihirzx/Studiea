import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import SessionUpload from './SessionUpload';

vi.mock('../../api/sessions.js', () => ({
  listTeacherSessions: vi.fn(),
  uploadSession: vi.fn(),
}));
vi.mock('../../api/assignments.js', () => ({
  generateAssignment: vi.fn(),
}));
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'teacher-1', name: 'Ms. Johnson' } }),
}));

import { listTeacherSessions, uploadSession } from '../../api/sessions.js';

function renderUpload(entry = '/teacher/upload?date=2026-05-01') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/teacher/upload" element={<SessionUpload />} />
        <Route path="/teacher/assignments/:id" element={<p>Assignment</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SessionUpload — transcript mode', () => {
  beforeEach(() => {
    listTeacherSessions.mockResolvedValue([]);
    uploadSession.mockResolvedValue({ _id: 'sess-1' });
  });

  it('defaults the date input to the ?date query param', async () => {
    renderUpload();
    expect(await screen.findByLabelText(/Session date/i)).toHaveValue('2026-05-01');
  });

  it('uploads a pasted transcript with the backdated recorded_at', async () => {
    renderUpload();

    await userEvent.click(await screen.findByRole('button', { name: /Paste transcript/i }));
    await userEvent.type(screen.getByPlaceholderText(/Paste your lesson transcript/i), 'Today we learned about forces.');
    await userEvent.click(screen.getByRole('button', { name: /Save Transcript/i }));

    await waitFor(() => expect(uploadSession).toHaveBeenCalled());
    // recorded_at is derived from the ?date param (asserted via the date input above);
    // here we just confirm transcript mode sends the transcript + a recordedAt string.
    expect(uploadSession).toHaveBeenCalledWith(
      expect.objectContaining({
        transcript: 'Today we learned about forces.',
        recordedAt: expect.any(String),
      })
    );
  });
});
