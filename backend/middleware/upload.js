import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME_TYPES = [
  'audio/wav', 'audio/mpeg', 'audio/mp4',
  'audio/webm', 'audio/ogg', 'audio/x-m4a'
];
const MAX_FILE_SIZE_MB = 50;

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
  cb(null, true);
};

export const audioUpload = multer({
  storage: multer.memoryStorage(), // hold in memory — stream directly to GCS, never write to disk
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter
});

// Call in the session upload controller, after multer runs, to verify magic bytes.
export const validateAudioBuffer = async (buffer) => {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
    throw new Error('File content does not match a supported audio format');
  }
};
