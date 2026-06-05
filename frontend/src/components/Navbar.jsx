import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const teacherLink = ({ isActive }) =>
  isActive
    ? 'font-semibold text-teacher-700 border-b-2 border-teacher-700 pb-0.5'
    : 'text-gray-600 hover:text-gray-900';

const studentLink = ({ isActive }) =>
  isActive
    ? 'font-semibold text-student-600 border-b-2 border-student-600 pb-0.5'
    : 'text-gray-600 hover:text-gray-900';

export default function Navbar() {
  const { token, role, logout } = useAuth();
  return (
    <nav className="flex items-center justify-between bg-white px-4 py-3 shadow">
      <NavLink to="/" className="text-lg font-bold text-indigo-600">Studiea</NavLink>
      <div className="flex items-center gap-4 text-sm">
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
        {token
          ? <button onClick={logout} className="text-red-600">Logout</button>
          : <NavLink to="/login" className={studentLink}>Login</NavLink>}
      </div>
    </nav>
  );
}
