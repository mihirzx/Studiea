import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth.js';
import AuthLayout, { authInputClass, authButtonClass } from '../components/AuthLayout.jsx';

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
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-teacher-700">Studiea</h1>
          <p className="mt-1 text-sm text-gray-500">Create your account</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          {['teacher', 'student'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border-2 py-2.5 text-sm font-semibold transition-colors ${
                role === r
                  ? 'border-teacher-700 bg-teacher-50 text-teacher-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {r === 'teacher' ? 'I\'m a Teacher' : 'I\'m a Student'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
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
              <label htmlFor="teacherId" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <button type="submit" disabled={isLoading} className={authButtonClass}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teacher-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
