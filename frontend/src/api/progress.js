import { apiFetch } from './client.js';

export const getProgress = (studentId) => apiFetch(`/progress/${studentId}`);

export const getClassProgress = (teacherId) => apiFetch(`/progress/class/${teacherId}`);
