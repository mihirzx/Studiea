import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Upload, FileAudio } from 'lucide-react';
import { BASE, authHeaders, apiFetch } from '../../api/client.js';
import { generateAssignment } from '../../api/assignments.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Modal from '../../components/Modal.jsx';

function SessionUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [lastSessionId, setLastSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch(`/sessions/teacher/${user.id}`);
        if (!cancelled) setSessions(Array.isArray(data) ? data : []);
      } catch {
        // Past sessions list is non-critical; fail silently
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  function handleFileSelect(selected) {
    if (!selected) return;
    setFile(selected);
    setUploadError('');
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return setUploadError('Please select an audio file first.');
    setUploadError('');
    setIsUploading(true);

    try {
      const fd = new FormData();
      fd.append('audio', file);

      // Use raw fetch — apiFetch forces Content-Type: application/json which breaks FormData boundary
      const res = await fetch(`${BASE}/sessions/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setLastSessionId(data._id || data.session_id || data.id);
      setFile(null);
      setSessions((prev) => [data, ...prev]);
      setModalOpen(true);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleGenerateAssignment() {
    if (!lastSessionId) return;
    setIsGenerating(true);
    try {
      const assignment = await generateAssignment(lastSessionId);
      const id = assignment._id || assignment.assignment_id || assignment.id;
      navigate(`/teacher/assignments/${id}`);
    } catch {
      setUploadError('Assignment generation failed. Try again from the dashboard.');
      setModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  }

  function formatBytes(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Upload Class Session"
          subtitle="Upload audio from your lesson — we'll transcribe it and generate a homework assignment."
          variant="teacher"
        />

        <form onSubmit={handleUpload}>
          <label
            htmlFor="audio-upload"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-14 transition-colors ${
              isDragging
                ? 'border-teacher-700 bg-teacher-50'
                : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            {file ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teacher-50">
                  <FileAudio className="h-7 w-7 text-teacher-700" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-400">{formatBytes(file.size)}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <Mic className="h-7 w-7 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">Drag & drop your audio file here</p>
                  <p className="mt-1 text-sm text-gray-400">or click to browse — MP3, WAV, M4A supported</p>
                </div>
              </>
            )}
            <input
              id="audio-upload"
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
          </label>

          {uploadError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {uploadError}
            </p>
          )}

          {isUploading ? (
            <div className="mt-4">
              <LoadingSpinner label="Uploading and transcribing — this may take a minute" />
            </div>
          ) : (
            <button
              type="submit"
              disabled={!file}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teacher-700 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teacher-800 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Upload & Transcribe
            </button>
          )}
        </form>

        <div className="mt-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Past Sessions
          </h2>
          {sessionsLoading ? (
            <LoadingSpinner size="sm" label="Loading sessions…" />
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-400">No sessions uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teacher-50">
                    <FileAudio className="h-4 w-4 text-teacher-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {s.recorded_at ? new Date(s.recorded_at).toLocaleString() : 'Session'}
                    </p>
                    {s.structured_notes?.topics?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {s.structured_notes.topics.slice(0, 3).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Session uploaded"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Done
            </button>
            <button
              onClick={handleGenerateAssignment}
              disabled={isGenerating}
              className="rounded-lg bg-teacher-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teacher-800 disabled:opacity-60"
            >
              {isGenerating ? 'Generating…' : 'Generate Assignment'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Your session has been transcribed and saved. Would you like to generate a homework assignment from it now?
        </p>
      </Modal>
    </div>
  );
}

export default SessionUpload;
