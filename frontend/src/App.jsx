import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import SessionUpload from './pages/teacher/SessionUpload.jsx';
import AssignmentReview from './pages/teacher/AssignmentReview.jsx';
import PendingAlerts from './pages/teacher/PendingAlerts.jsx';
import ClassRoster from './pages/teacher/ClassRoster.jsx';
import StudentProfile from './pages/teacher/StudentProfile.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import AssignmentView from './pages/student/AssignmentView.jsx';
import Feedback from './pages/student/Feedback.jsx';
import StudyBuddy from './pages/student/StudyBuddy.jsx';

// In-app chrome: navbar + constrained content area. Auth pages opt out of this
// to render their own full-bleed, navbar-less landing.
function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Auth landing — full-bleed, no navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Everything else runs inside the app chrome */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Teacher */}
        <Route element={<ProtectedRoute role="teacher" />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/upload" element={<SessionUpload />} />
          <Route path="/teacher/assignments/:id" element={<AssignmentReview />} />
          <Route path="/teacher/alerts" element={<PendingAlerts />} />
          <Route path="/teacher/roster" element={<ClassRoster />} />
          <Route path="/teacher/students/:id" element={<StudentProfile />} />
        </Route>

        {/* Student */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/assignments/:id" element={<AssignmentView />} />
          <Route path="/student/feedback/:id" element={<Feedback />} />
          <Route path="/student/study-buddy" element={<StudyBuddy />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}
