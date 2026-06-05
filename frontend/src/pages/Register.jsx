import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth.js';

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
    if (!name.trim()) return 'Name is required.';
    if (!email.trim()) return 'Email is required.';
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
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Create your Studiea account</h1>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setRole('teacher')}
          className={`flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-colors ${
            role === 'teacher'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          I'm a Teacher
        </button>
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-colors ${
            role === 'student'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          I'm a Student
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full rounded border p-2"
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          type="password"
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {role === 'student' && (
          <input
            className="w-full rounded border p-2"
            type="text"
            placeholder="Your teacher's ID"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          className="w-full rounded bg-indigo-600 py-2 text-white disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default Register;
