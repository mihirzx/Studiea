import DOMPurify from 'isomorphic-dompurify';

export const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';
  // Strip HTML
  let clean = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  // Cap length
  clean = clean.slice(0, 5000);
  // NOTE: This regex list is a shallow heuristic. It will not stop a determined
  // prompt injection attempt. The actual defense is XML tag isolation in promptBuilder.js —
  // the model is instructed to treat tagged content as data, not instructions.
  // Do not add to this list expecting it to fill security gaps. Fix those in promptBuilder.js.
  const injectionPatterns = [
    /ignore (all |previous |above )?instructions/gi,
    /forget (everything|all|previous)/gi,
    /you are now/gi,
    /new (role|persona|instructions)/gi,
    /system prompt/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi,
  ];
  injectionPatterns.forEach(p => { clean = clean.replace(p, '[removed]'); });
  return clean.trim();
};
