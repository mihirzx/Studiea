import { apiFetch } from './client.js';

export const getActivePlan = (studentId) =>
  apiFetch(`/study-plans/student/${studentId}`);

// mode: 'learn' (default) explains and may give answers; 'homework' guides without
// revealing answers. assignmentId scopes the buddy to that assignment's questions.
export const chat = (message, { mode, assignmentId } = {}) => {
  const body = { message };
  if (mode) body.mode = mode;
  if (assignmentId) body.assignment_id = assignmentId;
  return apiFetch('/study-plans/chat', { method: 'POST', body });
};

export const getChatHistory = (studentId) =>
  apiFetch(`/study-plans/chat/${studentId}`);

export const getPlanHistory = (studentId) =>
  apiFetch(`/study-plans/history/${studentId}`);
