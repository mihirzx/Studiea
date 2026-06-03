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

// TODO: helper to upload a buffer and return a private signed URL.
export const uploadAudio = async (/* buffer, filename, contentType */) => {
  throw new Error('Not implemented: uploadAudio (stream buffer to GCS, return signed URL)');
};
