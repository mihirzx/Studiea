import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth.js';
import AuthLayout, { authInputClass, authButtonClass } from '../components/AuthLayout.jsx';
import Logo from '../components/Logo.jsx';

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (!name.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email address is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (role === 'student' && !teacherId.trim()) return "Your teacher's ID is required.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) return setError(validationError);

    setIsLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'student') payload.teacher_id = teacherId;
      await register(payload);
      navigate('/login?registered=1');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-7 flex flex-col items-center text-center">
          <Logo variant="teacher" size="lg" />
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Create your account</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          {['teacher', 'student'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border-2 py-2.5 text-sm font-semibold transition-colors ${
                role === r
                  ? 'border-teacher-700 bg-teacher-50 text-teacher-700 dark:border-teacher-500 dark:bg-teacher-900/30 dark:text-teacher-200'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
              }`}
            >
              {r === 'teacher' ? 'I\'m a Teacher' : 'I\'m a Student'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className={authInputClass}
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={authInputClass}
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={authInputClass}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {role === 'student' && (
            <div>
              <label htmlFor="teacherId" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Teacher ID
              </label>
              <input
                id="teacherId"
                type="text"
                className={authInputClass}
                placeholder="Your teacher will provide this"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900">
              {error}
            </p>
          )}

          <button type="submit" disabled={isLoading} className={authButtonClass}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teacher-700 hover:underline dark:text-teacher-300">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
