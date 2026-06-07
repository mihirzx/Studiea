import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import AuthLayout, { authInputClass, authButtonClass } from '../components/AuthLayout.jsx';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.error) return setError(res.error);
      navigate(res.user?.role === 'teacher' ? '/teacher' : '/student');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-teacher-700">Studiea</h1>
          <p className="mt-1 text-sm text-gray-500">AI-Powered Classroom Platform</p>
        </div>

        {justRegistered && (
          <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200">
            Account created — sign in to get started.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
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
              autoComplete="current-password"
              required
              className={authInputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <button type="submit" disabled={isLoading} className={authButtonClass}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-teacher-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
