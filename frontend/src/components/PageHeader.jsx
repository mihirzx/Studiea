function PageHeader({ title, subtitle, variant = 'student', children }) {
  const headingClass =
    variant === 'teacher'
      ? 'text-slate-900 border-b border-slate-200 pb-4 dark:text-slate-100 dark:border-slate-800'
      : 'text-violet-900 pb-4 dark:text-violet-200';

  return (
    <div className={`mb-6 flex items-start justify-between ${headingClass}`}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export default PageHeader;
