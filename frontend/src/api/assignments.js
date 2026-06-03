import { apiFetch } from './client.js';

export const generateAssignment = (sessionId) =>
  apiFetch('/assignments/generate', { method: 'POST', body: { session_id: sessionId } });

export const getAssignment = (id) => apiFetch(`/assignments/${id}`);

export const listStudentAssignments = (studentId) =>
  apiFetch(`/assignments/student/${studentId}`);

export const listTeacherAssignments = (teacherId) =>
  apiFetch(`/assignments/teacher/${teacherId}`);

export const updateAssignment = (id, patch) =>
  apiFetch(`/assignments/${id}`, { method: 'PATCH', body: patch });
