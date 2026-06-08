// Mock data layer for Mastery Badges.
//
// Real REST contract for the backend implementation:
//   GET    /students/:id/badges                 -> Badge[]
//   POST   /students/:id/badges  { label, topic } -> Badge
//   DELETE /students/:id/badges/:badgeId        -> { success: true }
//
// Badge shape: { id, label, topic, awarded_at }
//
// For now we work in localStorage

const STORAGE_KEY = 'studiea_badges';

// Read the whole { [studentId]: Badge[] } map out of localStorage.
function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

// GET the badges for one student.
export function listStudentBadges(studentId) {
  const all = readAll();
  return Promise.resolve(all[studentId] || []);
}

// POST a new badge for a student. Returns the created badge.
export function awardBadge(studentId, { label, topic }) {
  const all = readAll();
  const badge = {
    id: crypto.randomUUID(),
    label,
    topic: topic || null,
    awarded_at: new Date().toISOString(),
  };
  all[studentId] = [badge, ...(all[studentId] || [])];
  writeAll(all);
  return Promise.resolve(badge);
}

// DELETE a badge from a student.
export function removeBadge(studentId, badgeId) {
  const all = readAll();
  all[studentId] = (all[studentId] || []).filter((b) => b.id !== badgeId);
  writeAll(all);
  return Promise.resolve();
}
