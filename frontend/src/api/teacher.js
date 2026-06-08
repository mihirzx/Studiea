import { apiFetch } from './client.js';

export const listStudents = (teacherId) =>
  apiFetch(`/teacher/${teacherId}/students`);

// filters: { assignment_id?, topic?, from?, to? } — any subset. Empty values are dropped.
export const getStudentStats = (teacherId, studentId, filters = {}) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.append(key, value);
  }
  const qs = params.toString();
  return apiFetch(`/teacher/${teacherId}/students/${studentId}/stats${qs ? `?${qs}` : ''}`);
};
