import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const data = await register(email, password);
      if (data?.session?.access_token) {
        navigate('/dashboard');
      } else {
        setSuccess('Registration successful. Confirm your email, then log in.');
      }
    } catch (err) {
      const backendError = err.response?.data?.error;
      const validationErrors = err.response?.data;
      if (backendError) {
        setError(backendError);
      } else if (validationErrors && typeof validationErrors === 'object') {
        const firstField = Object.values(validationErrors).flat?.()?.[0] || Object.values(validationErrors)[0];
        setError(Array.isArray(firstField) ? firstField[0] : firstField || err.message || 'Registration failed');
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 py-10">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md">
        <p className="text-xs text-cyan-300 tracking-[0.2em] mb-3">NEW OPERATOR</p>
        <h1 className="heading-display text-3xl text-cyan-100 mb-7">REGISTER</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-xs text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              className="mt-2 w-full rounded-lg px-4 py-3 bg-black/60 border border-cyan-500/30 focus:border-cyan-300 outline-none"
              placeholder="engineer@company.com"
            />
          </label>

          <label className="block">
            <span className="text-xs text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
              className="mt-2 w-full rounded-lg px-4 py-3 bg-black/60 border border-cyan-500/30 focus:border-cyan-300 outline-none"
              placeholder="minimum 8 chars"
            />
          </label>

          <label className="block">
            <span className="text-xs text-slate-300">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={submitting}
              className="mt-2 w-full rounded-lg px-4 py-3 bg-black/60 border border-cyan-500/30 focus:border-cyan-300 outline-none"
            />
          </label>

          {error ? <p className="text-sm text-rose-300 border border-rose-500/40 rounded-lg px-3 py-2">{error}</p> : null}
          {success ? <p className="text-sm text-lime-300 border border-lime-500/30 rounded-lg px-3 py-2">{success}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg px-4 py-3 border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"
          >
            {submitting ? 'PROVISIONING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-300">
          Already onboarded? <Link className="text-cyan-300 hover:text-cyan-100" to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}
