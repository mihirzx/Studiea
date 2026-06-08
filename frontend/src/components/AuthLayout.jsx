import { Link } from 'react-router-dom';
import AgentShowcase from './AgentShowcase.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';

// Shared field/button styling for the auth pages. Kept here so Login and Register
// never drift apart.
export const authInputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 ' +
  'placeholder-gray-400 transition duration-200 focus:border-teacher-600 focus:outline-none ' +
  'focus:ring-4 focus:ring-teacher-600/10 focus:shadow-[0_4px_12px_-2px_rgba(37,99,235,0.15)] ' +
  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500';

export const authButtonClass =
  'w-full rounded-lg bg-teacher-700 py-2.5 text-sm font-semibold text-white shadow-sm ' +
  'transition-all duration-200 hover:bg-teacher-800 hover:scale-[1.02] hover:shadow-md ' +
  'active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100';

// Immersive full-height auth shell: subtle mesh background, brand wordmark, and a
// 40/60 split with the form on the left and the animated agent showcase on the right.
// On screens below `lg` the showcase is hidden and the form fills the width.
function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[#fafbff] bg-mesh dark:bg-slate-950 dark:bg-mesh-dark">
      <Link to="/login" className="absolute left-6 top-5 z-20">
        <Logo variant="teacher" />
      </Link>
      <ThemeToggle className="absolute right-6 top-4 z-20" />

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5">
        <div className="flex items-center justify-center px-4 py-12 lg:col-span-2">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <div className="hidden lg:col-span-3 lg:block">
          <AgentShowcase />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
