import { apiFetch } from './client.js';

export const getActivePlan = (studentId) =>
  apiFetch(`/study-plans/student/${studentId}`);

export const chat = (message) =>
  apiFetch('/study-plans/chat', { method: 'POST', body: { message } });

export const getChatHistory = (studentId) =>
  apiFetch(`/study-plans/chat/${studentId}`);

export const getPlanHistory = (studentId) =>
  apiFetch(`/study-plans/history/${studentId}`);
