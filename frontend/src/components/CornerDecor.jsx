// Subtle decorative background for student pages: soft blurred violet/teal blobs
// anchored to the corners, filling the empty side margins. Purely visual.
//
// Sits at -z-10 so it paints above the page background but behind all content —
// the parent must be `relative overflow-hidden`. No need to set z-index on content.
function CornerDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="absolute -right-28 top-8 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-teal-100/50 blur-3xl" />
    </div>
  );
}

export default CornerDecor;
