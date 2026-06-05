// GCP Speech-to-Text + Cloud Storage clients.
// Uses Application Default Credentials (ADC) in Cloud Run; locally set
// GOOGLE_APPLICATION_CREDENTIALS to a service-account key path.
import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';

export const speechClient = new SpeechClient({
  projectId: process.env.GCP_PROJECT_ID
});

export const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID
});

export const audioBucket = () => storage.bucket(process.env.GCP_BUCKET_NAME);

// True only when a GCS bucket is configured for real audio storage.
export const gcsEnabled = () => Boolean(process.env.GCP_BUCKET_NAME && process.env.GCP_PROJECT_ID);

// Upload a buffer to the private bucket and return a time-limited signed URL.
// Returns null (rather than throwing) when GCS isn't configured, so the
// transcript-fallback path can still create sessions in dev/demo.
export const uploadAudio = async (buffer, filename, contentType) => {
  if (!gcsEnabled()) return null;
  const file = audioBucket().file(`sessions/${filename}`);
  await file.save(buffer, { contentType, resumable: false });
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  return url;
};
