function LoadingSpinner({ size = 'md', label = 'Loading…' }) {
  const sizeClass = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`${sizeClass} animate-spin rounded-full border-4 border-gray-200 border-t-teacher-700`}
        role="status"
      />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export default LoadingSpinner;
