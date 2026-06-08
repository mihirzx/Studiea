import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import Feedback from './Feedback';

vi.mock('../../api/submissions.js', () => ({
  getSubmission: vi.fn(),
}));

import { getSubmission } from '../../api/submissions.js';

function renderFeedback(submissionId = 'sub-1') {
  return render(
    <MemoryRouter initialEntries={[`/student/feedback/${submissionId}`]}>
      <Routes>
        <Route path="/student/feedback/:id" element={<Feedback />} />
        <Route path="/student" element={<p>Dashboard</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Feedback — approval guard (security-critical)', () => {
  it('shows holding screen and no score when status is "pending"', async () => {
    getSubmission.mockResolvedValue({
      _id: 'sub-1',
      status: 'pending',
      score: 85,
      proposed_score: 85,
      feedback: 'Great work!',
    });

    renderFeedback();
    expect(await screen.findByText(/Your teacher is reviewing/i)).toBeInTheDocument();
    expect(screen.queryByText('85')).not.toBeInTheDocument();
    expect(screen.queryByText('Great work!')).not.toBeInTheDocument();
  });

  it('shows holding screen and no score when status is "flagged"', async () => {
    getSubmission.mockResolvedValue({
      _id: 'sub-1',
      status: 'flagged',
      score: 72,
      proposed_score: 72,
    });

    renderFeedback();
    expect(await screen.findByText(/Your teacher is reviewing/i)).toBeInTheDocument();
    expect(screen.queryByText('72')).not.toBeInTheDocument();
  });

  it('shows holding screen and no score when status is "pending_approval"', async () => {
    getSubmission.mockResolvedValue({
      _id: 'sub-1',
      status: 'pending_approval',
      score: 90,
      proposed_score: 90,
    });

    renderFeedback();
    expect(await screen.findByText(/Your teacher is reviewing/i)).toBeInTheDocument();
    expect(screen.queryByText('90')).not.toBeInTheDocument();
  });

  it('NEVER renders proposed_score regardless of status', async () => {
    getSubmission.mockResolvedValue({
      _id: 'sub-1',
      status: 'pending',
      score: null,
      proposed_score: 77,
      feedback: 'Secret feedback',
    });

    renderFeedback();
    await screen.findByText(/Your teacher is reviewing/i);
    expect(screen.queryByText('77')).not.toBeInTheDocument();
    expect(screen.queryByText('Secret feedback')).not.toBeInTheDocument();
  });

  it('shows score and headline when status is "approved"', async () => {
    getSubmission.mockResolvedValue({
      _id: 'sub-1',
      status: 'approved',
      score: 92,
      feedback: 'Excellent understanding of the topic.',
      answers: [],
      weak_areas: [],
    });

    renderFeedback();
    expect(await screen.findByText(/92/)).toBeInTheDocument();
    expect(screen.getByText(/Excellent work/i)).toBeInTheDocument();
  });

  it('shows correct bracket headline for mid-range score (60–79)', async () => {
    getSubmission.mockResolvedValue({
      _id: 'sub-1',
      status: 'approved',
      score: 70,
      answers: [],
      weak_areas: [],
    });

    renderFeedback();
    expect(await screen.findByText(/Good job/i)).toBeInTheDocument();
  });

  it('shows encouraging headline for low score (<60)', async () => {
    getSubmission.mockResolvedValue({
      _id: 'sub-1',
      status: 'approved',
      score: 45,
      answers: [],
      weak_areas: [],
    });

    renderFeedback();
    expect(await screen.findByText(/Keep at it/i)).toBeInTheDocument();
  });
});

describe('Feedback — per-question verdict indicators', () => {
  it('renders correct/partial/incorrect badges when answers carry a verdict', async () => {
    getSubmission.mockResolvedValue({
      _id: 'sub-1',
      status: 'approved',
      score: 80,
      weak_areas: [],
      answers: [
        { question_id: 'q1', answer: 'a1', verdict: 'correct' },
        { question_id: 'q2', answer: 'a2', verdict: 'partial' },
        { question_id: 'q3', answer: 'a3', verdict: 'incorrect' },
      ],
    });

    renderFeedback();

    expect(await screen.findByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Partial')).toBeInTheDocument();
    expect(screen.getByText('Needs work')).toBeInTheDocument();
  });

  it('renders no verdict badges when answers have no verdict (graceful)', async () => {
    getSubmission.mockResolvedValue({
      _id: 'sub-1',
      status: 'approved',
      score: 80,
      weak_areas: [],
      answers: [{ question_id: 'q1', answer: 'a1' }],
    });

    renderFeedback();

    // Answer still renders, but no verdict badge text appears
    expect(await screen.findByText('a1')).toBeInTheDocument();
    expect(screen.queryByText('Correct')).not.toBeInTheDocument();
    expect(screen.queryByText('Partial')).not.toBeInTheDocument();
    expect(screen.queryByText('Needs work')).not.toBeInTheDocument();
  });
});
