import { Link } from 'react-router-dom';
import AgentShowcase from './AgentShowcase.jsx';

// Shared field/button styling for the auth pages. Kept here so Login and Register
// never drift apart.
export const authInputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 ' +
  'placeholder-gray-400 transition duration-200 focus:border-teacher-600 focus:outline-none ' +
  'focus:ring-4 focus:ring-teacher-600/10 focus:shadow-[0_4px_12px_-2px_rgba(37,99,235,0.15)]';

export const authButtonClass =
  'w-full rounded-lg bg-teacher-700 py-2.5 text-sm font-semibold text-white shadow-sm ' +
  'transition-all duration-200 hover:bg-teacher-800 hover:scale-[1.02] hover:shadow-md ' +
  'active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100';

// Immersive full-height auth shell: subtle mesh background, brand wordmark, and a
// 40/60 split with the form on the left and the animated agent showcase on the right.
// On screens below `lg` the showcase is hidden and the form fills the width.
function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[#fafbff] bg-mesh">
      <Link
        to="/login"
        className="absolute left-6 top-5 z-20 text-lg font-bold tracking-tight text-teacher-700"
      >
        Studiea
      </Link>

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
