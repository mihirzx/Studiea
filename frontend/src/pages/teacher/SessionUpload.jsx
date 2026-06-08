import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, Upload, FileAudio, FileText } from 'lucide-react';
import { listTeacherSessions, uploadSession } from '../../api/sessions.js';
import { generateAssignment } from '../../api/assignments.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Modal from '../../components/Modal.jsx';

// Local-time YYYY-MM-DD (for the date input default).
function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Convert a YYYY-MM-DD input to a local-noon ISO string so the stored date lands
// on the intended calendar day regardless of timezone.
function dateInputToISO(dateStr) {
  if (!dateStr) return undefined;
  const d = new Date(`${dateStr}T12:00:00`);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function SessionUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [uploadMode, setUploadMode] = useState('audio'); // 'audio' | 'transcript'
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [recordedAt, setRecordedAt] = useState(searchParams.get('date') || todayKey());
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [directive, setDirective] = useState('');
  const [lastSessionId, setLastSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listTeacherSessions(user.id);
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
    if (uploadMode === 'audio' && !file) return setUploadError('Please select an audio file first.');
    if (uploadMode === 'transcript' && !transcript.trim()) return setUploadError('Please paste a transcript first.');
    setUploadError('');
    setIsUploading(true);

    try {
      const payload = {
        recordedAt: dateInputToISO(recordedAt),
        ...(uploadMode === 'audio' ? { audioFile: file } : { transcript: transcript.trim() }),
      };
      const data = await uploadSession(payload);
      if (data.error) throw new Error(data.error);

      setLastSessionId(data._id || data.session_id || data.id);
      setFile(null);
      setTranscript('');
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
      const assignment = await generateAssignment(lastSessionId, directive);
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

  const modeTab = (mode, label, Icon) => (
    <button
      type="button"
      onClick={() => { setUploadMode(mode); setUploadError(''); }}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-semibold transition-colors ${
        uploadMode === mode
          ? 'border-teacher-700 bg-teacher-50 text-teacher-700 dark:border-teacher-500 dark:bg-teacher-900/30 dark:text-teacher-200'
          : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Upload Class Session"
          subtitle="Upload lesson audio or paste a transcript — we'll structure it and generate homework."
          variant="teacher"
        />

        <form onSubmit={handleUpload}>
          <div className="mb-4 flex gap-2">
            {modeTab('audio', 'Upload audio', FileAudio)}
            {modeTab('transcript', 'Paste transcript', FileText)}
          </div>

          <div className="mb-4">
            <label htmlFor="session-date" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Session date
            </label>
            <input
              id="session-date"
              type="date"
              value={recordedAt}
              max={todayKey()}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teacher-700 focus:outline-none focus:ring-2 focus:ring-teacher-700/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark]"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">When did this lesson happen? Defaults to today.</p>
          </div>

          {uploadMode === 'audio' ? (
            <label
              htmlFor="audio-upload"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-14 transition-colors ${
                isDragging
                  ? 'border-teacher-700 bg-teacher-50 dark:border-teacher-500 dark:bg-teacher-900/30'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800'
              }`}
            >
              {file ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teacher-50 dark:bg-teacher-900/40">
                    <FileAudio className="h-7 w-7 text-teacher-700 dark:text-teacher-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800 dark:text-slate-200">{file.name}</p>
                    <p className="text-sm text-gray-400 dark:text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
                    <Mic className="h-7 w-7 text-gray-400 dark:text-slate-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700 dark:text-slate-300">Drag & drop your audio file here</p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">or click to browse — MP3, WAV, M4A supported</p>
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
          ) : (
            <textarea
              rows={10}
              className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-teacher-700 focus:outline-none focus:ring-2 focus:ring-teacher-700/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
              placeholder="Paste your lesson transcript here…"
              value={transcript}
              onChange={(e) => { setTranscript(e.target.value); setUploadError(''); }}
            />
          )}

          {uploadError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900">
              {uploadError}
            </p>
          )}

          {isUploading ? (
            <div className="mt-4">
              <LoadingSpinner label="Processing — this may take a minute" />
            </div>
          ) : (
            <button
              type="submit"
              disabled={uploadMode === 'audio' ? !file : !transcript.trim()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teacher-700 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teacher-800 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploadMode === 'audio' ? 'Upload & Transcribe' : 'Save Transcript'}
            </button>
          )}
        </form>

        <div className="mt-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
            Past Sessions
          </h2>
          {sessionsLoading ? (
            <LoadingSpinner size="sm" label="Loading sessions…" />
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-500">No sessions uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teacher-50 dark:bg-teacher-900/40">
                    <FileAudio className="h-4 w-4 text-teacher-700 dark:text-teacher-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                      {s.recorded_at ? new Date(s.recorded_at).toLocaleDateString() : 'Session'}
                    </p>
                    {s.structured_notes?.topics?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 dark:text-slate-500">
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
        title="Session saved"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Your session has been saved. Generate a homework assignment from it now?
        </p>
        <div className="mt-4">
          <label htmlFor="directive" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Teaching directive <span className="font-normal text-gray-400 dark:text-slate-500">(optional)</span>
          </label>
          <textarea
            id="directive"
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-teacher-700 focus:outline-none focus:ring-2 focus:ring-teacher-700/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
            placeholder="How should the AI guide students for this assignment? Leave blank to use the default."
            value={directive}
            onChange={(e) => setDirective(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default SessionUpload;
