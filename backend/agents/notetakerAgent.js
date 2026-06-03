// Agent 1 — Notetaker
// Input: audio file URL or live stream.
import { speechClient } from '../config/gcp.js';
import { generateJSON } from '../utils/gemini.js';
import { buildNotetakerPrompt } from '../utils/promptBuilder.js';
import Session from '../models/Session.js';

/**
 * Process a class recording into a saved Session.
 * Step 1: Send audio to GCP Speech-to-Text -> raw transcript.
 * Step 2: Send transcript to Gemini -> structured notes
 *         (key topics, learning objectives, examples, homework hints). JSON only.
 * Step 3: Save session (transcript + structured_notes + syllabus_context).
 * Step 4: Return session_id (optionally triggers Agent 2; teacher can also trigger manually).
 *
 * @param {{ teacherId: string, audioUrl?: string, audioBuffer?: Buffer }} input
 * @returns {Promise<string>} session_id
 */
export const runNotetaker = async ({ teacherId, audioUrl /*, audioBuffer */ }) => {
  // TODO Step 1: const [resp] = await speechClient.recognize({ ... }); transcript = ...
  // TODO Step 2: const structured = await generateJSON(buildNotetakerPrompt(transcript));
  // TODO Step 3: const session = await Session.create({ teacher_id: teacherId, audio_url: audioUrl, transcript, structured_notes, syllabus_context });
  // TODO Step 4: return session._id;
  void speechClient; void generateJSON; void buildNotetakerPrompt; void Session;
  throw new Error('Not implemented: runNotetaker');
};
