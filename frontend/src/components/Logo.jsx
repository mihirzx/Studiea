// Studiea brand mark + wordmark. Role-aware: purple on the student side, blue on
// the teacher side. The SVG fills with `currentColor`, so a single text-color class
// themes both the tile and the wordmark.

const VARIANT_COLOR = {
  teacher: 'text-teacher-700',
  student: 'text-student-600',
};

const SIZE = {
  sm: { mark: 'h-6 w-6', text: 'text-base' },
  md: { mark: 'h-7 w-7', text: 'text-lg' },
  lg: { mark: 'h-9 w-9', text: 'text-2xl' },
};

function Logo({ variant = 'teacher', size = 'md', showWordmark = true, className = '' }) {
  const sizing = SIZE[size] || SIZE.md;
  return (
    <span className={`inline-flex items-center gap-2 ${VARIANT_COLOR[variant] || VARIANT_COLOR.teacher} ${className}`}>
      <svg viewBox="0 0 32 32" className={sizing.mark} aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="9" fill="currentColor" />
        {/* 4-point spark */}
        <path
          d="M16 7 l2.6 5.8 5.8 2.6 -5.8 2.6 -2.6 5.8 -2.6 -5.8 -5.8 -2.6 5.8 -2.6 Z"
          fill="#ffffff"
        />
      </svg>
      {showWordmark && (
        <span className={`font-bold tracking-tight ${sizing.text}`}>Studiea</span>
      )}
    </span>
  );
}

export default Logo;
