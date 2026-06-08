import { BASE, authHeaders, apiFetch } from './client.js';

export const listTeacherSessions = (teacherId) =>
  apiFetch(`/sessions/teacher/${teacherId}`);

/**
 * Upload a session as either an audio file or a pasted transcript, optionally
 * backdated to recordedAt (ISO string or YYYY-MM-DD).
 *
 * Audio must go through FormData/raw fetch — apiFetch forces a JSON Content-Type,
 * which corrupts the multipart boundary. Transcript-only uploads use plain JSON.
 */
export const uploadSession = async ({ audioFile, transcript, recordedAt } = {}) => {
  if (audioFile) {
    const fd = new FormData();
    fd.append('audio', audioFile);
    if (recordedAt) fd.append('recorded_at', recordedAt);
    const res = await fetch(`${BASE}/sessions/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Upload failed');
    return data;
  }

  const body = { transcript };
  if (recordedAt) body.recorded_at = recordedAt;
  return apiFetch('/sessions/upload', { method: 'POST', body });
};
