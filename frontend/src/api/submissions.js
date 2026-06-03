import { apiFetch } from './client.js';

export const submitAnswers = (assignmentId, answers) =>
  apiFetch('/submissions/submit', { method: 'POST', body: { assignment_id: assignmentId, answers } });

export const getSubmission = (id) => apiFetch(`/submissions/${id}`);

export const listStudentSubmissions = (studentId) =>
  apiFetch(`/submissions/student/${studentId}`);

export const listAssignmentSubmissions = (assignmentId) =>
  apiFetch(`/submissions/assignment/${assignmentId}`);

export const getPendingAlerts = (teacherId) =>
  apiFetch(`/submissions/pending-alerts/${teacherId}`);

export const approveSubmission = (id) =>
  apiFetch(`/submissions/${id}/approve`, { method: 'PATCH' });
