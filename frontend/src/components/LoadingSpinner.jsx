function LoadingSpinner({ size = 'md', label = 'Loading…' }) {
  const sizeClass = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <div
        className={`${sizeClass} animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600`}
        role="status"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
