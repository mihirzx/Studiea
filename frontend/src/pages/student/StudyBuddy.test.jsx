import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import StudyBuddy from './StudyBuddy';

vi.mock('../../api/studyPlans.js', () => ({
  chat: vi.fn(),
  getChatHistory: vi.fn(),
  getActivePlan: vi.fn(),
}));
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'student-1', name: 'Alex' } }),
}));

import { chat, getChatHistory, getActivePlan } from '../../api/studyPlans.js';

function renderStudyBuddy() {
  return render(
    <MemoryRouter>
      <StudyBuddy />
    </MemoryRouter>
  );
}

describe('StudyBuddy — chat behavior', () => {
  beforeEach(() => {
    getChatHistory.mockResolvedValue([]);
    getActivePlan.mockResolvedValue(null);
  });

  it('shows empty state when no chat history exists', async () => {
    renderStudyBuddy();
    expect(await screen.findByText(/Your Study Buddy is ready/i)).toBeInTheDocument();
  });

  it('appends user message optimistically before API resolves', async () => {
    let resolveChat;
    chat.mockImplementation(() => new Promise((res) => { resolveChat = res; }));

    renderStudyBuddy();
    await screen.findByText(/Your Study Buddy is ready/i);

    const textarea = screen.getByPlaceholderText(/Ask your Study Buddy/i);
    await userEvent.type(textarea, 'What is photosynthesis?');
    await userEvent.click(screen.getByRole('button', { name: /Send/i }));

    // User message appears before API responds
    expect(screen.getByText('What is photosynthesis?')).toBeInTheDocument();

    resolveChat({ message: 'Photosynthesis is...' });
    expect(await screen.findByText(/Photosynthesis is/i)).toBeInTheDocument();
  });

  it('clears input after sending', async () => {
    chat.mockResolvedValue({ message: 'Great question!' });

    renderStudyBuddy();
    await screen.findByText(/Your Study Buddy is ready/i);

    const textarea = screen.getByPlaceholderText(/Ask your Study Buddy/i);
    await userEvent.type(textarea, 'Hello?');
    await userEvent.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => expect(textarea).toHaveValue(''));
  });

  it('disables Send button while a message is being sent, re-enables after response', async () => {
    let resolveChat;
    chat.mockImplementation(() => new Promise((res) => { resolveChat = res; }));

    renderStudyBuddy();
    await screen.findByText(/Your Study Buddy is ready/i);

    const textarea = screen.getByPlaceholderText(/Ask your Study Buddy/i);
    await userEvent.type(textarea, 'Tell me more');
    await userEvent.click(screen.getByRole('button', { name: /Send/i }));

    // Button must be disabled while isSending is true (even though input was just cleared)
    expect(screen.getByRole('button', { name: /Send/i })).toBeDisabled();

    resolveChat({ message: 'Here is more...' });
    await screen.findByText(/Here is more/i);

    // Type new text so the input is non-empty — button re-enables after isSending clears
    await userEvent.type(textarea, 'follow up');
    expect(screen.getByRole('button', { name: /Send/i })).not.toBeDisabled();
  });
});
