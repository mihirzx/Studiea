import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const teacherLink = ({ isActive }) =>
  isActive
    ? 'font-semibold text-teacher-700 border-b-2 border-teacher-700 pb-0.5 dark:text-teacher-200 dark:border-teacher-200'
    : 'text-gray-500 hover:text-gray-800 transition-colors dark:text-slate-400 dark:hover:text-slate-200';

const studentLink = ({ isActive }) =>
  isActive
    ? 'font-semibold text-student-600 border-b-2 border-student-600 pb-0.5 dark:text-student-400 dark:border-student-400'
    : 'text-gray-500 hover:text-gray-800 transition-colors dark:text-slate-400 dark:hover:text-slate-200';

function Navbar() {
  const { token, role, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2">
          <Logo variant={role === 'student' ? 'student' : 'teacher'} />
        </NavLink>

        <div className="flex items-center gap-6 text-sm">
          {token && role === 'teacher' && (
            <>
              <NavLink to="/teacher" end className={teacherLink}>Dashboard</NavLink>
              <NavLink to="/teacher/upload" className={teacherLink}>Upload</NavLink>
              <NavLink to="/teacher/roster" className={teacherLink}>Class Roster</NavLink>
              <NavLink to="/teacher/alerts" className={teacherLink}>Alerts</NavLink>
            </>
          )}
          {token && role === 'student' && (
            <>
              <NavLink to="/student" end className={studentLink}>Dashboard</NavLink>
              <NavLink to="/student/study-buddy" className={studentLink}>Study Buddy</NavLink>
            </>
          )}

          <ThemeToggle />

          {token ? (
            <button
              onClick={logout}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sign out
            </button>
          ) : (
            <NavLink
              to="/login"
              className="rounded-lg bg-teacher-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teacher-800 transition-colors"
            >
              Sign in
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
