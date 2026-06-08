import { apiFetch } from './client.js';

// teachingDirective (optional) tells the AI how to teach/give feedback for this
// assignment; omitted → backend falls back to its default directive.
export const generateAssignment = (sessionId, teachingDirective) => {
  const body = { session_id: sessionId };
  if (teachingDirective?.trim()) body.teaching_directive = teachingDirective.trim();
  return apiFetch('/assignments/generate', { method: 'POST', body });
};

export const getAssignment = (id) => apiFetch(`/assignments/${id}`);

export const listStudentAssignments = (studentId) =>
  apiFetch(`/assignments/student/${studentId}`);

export const listTeacherAssignments = (teacherId) =>
  apiFetch(`/assignments/teacher/${teacherId}`);

export const updateAssignment = (id, patch) =>
  apiFetch(`/assignments/${id}`, { method: 'PATCH', body: patch });
