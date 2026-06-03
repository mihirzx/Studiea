import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar() {
  const { token, role, logout } = useAuth();
  return (
    <nav className="flex items-center justify-between bg-white px-4 py-3 shadow">
      <Link to="/" className="text-lg font-bold text-indigo-600">Studiea</Link>
      <div className="flex items-center gap-4 text-sm">
        {token && role === 'teacher' && (
          <>
            <Link to="/teacher">Dashboard</Link>
            <Link to="/teacher/upload">Upload</Link>
            <Link to="/teacher/alerts">Alerts</Link>
          </>
        )}
        {token && role === 'student' && (
          <>
            <Link to="/student">Dashboard</Link>
            <Link to="/student/study-buddy">Study Buddy</Link>
          </>
        )}
        {token
          ? <button onClick={logout} className="text-red-600">Logout</button>
          : <Link to="/login">Login</Link>}
      </div>
    </nav>
  );
}
