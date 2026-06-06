import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const teacherLink = ({ isActive }) =>
  isActive
    ? 'font-semibold text-teacher-700 border-b-2 border-teacher-700 pb-0.5'
    : 'text-gray-500 hover:text-gray-800 transition-colors';

const studentLink = ({ isActive }) =>
  isActive
    ? 'font-semibold text-student-600 border-b-2 border-student-600 pb-0.5'
    : 'text-gray-500 hover:text-gray-800 transition-colors';

function Navbar() {
  const { token, role, logout, user } = useAuth();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-teacher-700">Studiea</span>
        </NavLink>

        <div className="flex items-center gap-6 text-sm">
          {token && role === 'teacher' && (
            <>
              <NavLink to="/teacher" end className={teacherLink}>Dashboard</NavLink>
              <NavLink to="/teacher/upload" className={teacherLink}>Upload</NavLink>
              <NavLink to="/teacher/alerts" className={teacherLink}>Alerts</NavLink>
            </>
          )}
          {token && role === 'student' && (
            <>
              <NavLink to="/student" end className={studentLink}>Dashboard</NavLink>
              <NavLink to="/student/study-buddy" className={studentLink}>Study Buddy</NavLink>
            </>
          )}
          {token ? (
            <button
              onClick={logout}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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
