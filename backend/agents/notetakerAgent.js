// Agent 1 — Notetaker
// Input: an audio buffer (real STT) OR a pasted transcript (dev/demo fallback).
import { speechClient, uploadAudio, gcsEnabled } from '../config/gcp.js';
import { generateJSON } from '../utils/gemini.js';
import { buildNotetakerPrompt } from '../utils/promptBuilder.js';
import Session from '../models/Session.js';

// Run GCP Speech-to-Text over an audio buffer and return the joined transcript.
const transcribeAudio = async (buffer, encodingHint) => {
  const [response] = await speechClient.recognize({
    audio: { content: buffer.toString('base64') },
    config: {
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      // Let GCP infer encoding/sample rate where possible; webm/ogg are common from browsers.
      ...(encodingHint ? { encoding: encodingHint } : {})
    }
  });
  return (response.results || [])
    .map((r) => r.alternatives?.[0]?.transcript || '')
    .join(' ')
    .trim();
};

// Derive a short syllabus_context string from the structured notes object.
const toSyllabusContext = (notes) => {
  const topics = Array.isArray(notes?.topics) ? notes.topics : [];
  const objectives = Array.isArray(notes?.objectives) ? notes.objectives : [];
  return [...topics, ...objectives].join('; ');
};

/**
 * Turn a class recording (or pasted transcript) into a saved Session with structured notes.
 *
 * @param {{ teacherId: string, audioBuffer?: Buffer, mimeType?: string, transcript?: string }} input
 * @returns {Promise<object>} the saved Session document
 */
export const runNotetaker = async ({ teacherId, audioBuffer, mimeType, transcript }) => {
  let finalTranscript = (transcript || '').trim();
  let audioUrl = null;

  // Real audio path: store the file and transcribe it.
  if (!finalTranscript && audioBuffer) {
    if (!gcsEnabled() && !speechClient) {
      throw new Error('No transcript provided and GCP Speech-to-Text is not configured');
    }
    audioUrl = await uploadAudio(audioBuffer, `${teacherId}-${Date.now()}`, mimeType);
    finalTranscript = await transcribeAudio(audioBuffer);
  }

  if (!finalTranscript) throw new Error('No transcript could be produced');

  // Structure the transcript with Gemini (returns { topics, objectives, examples, homework_hints }).
  const structured = await generateJSON(buildNotetakerPrompt(finalTranscript));

  const session = await Session.create({
    teacher_id: teacherId,
    audio_url: audioUrl,
    transcript: finalTranscript,
    structured_notes: structured,
    syllabus_context: toSyllabusContext(structured)
  });

  return session;
};
