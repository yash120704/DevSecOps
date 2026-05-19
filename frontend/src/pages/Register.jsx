import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationPending, setShowVerificationPending] = useState(false);
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

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await register(email, password);
      // Show verification pending page instead of redirecting
      setShowVerificationPending(true);
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

  if (showVerificationPending) {
    return (
      <section className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 py-10">
        <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-cyan-500/20 border border-cyan-500/40">
              <svg className="w-10 h-10 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <p className="text-xs text-cyan-300 tracking-[0.2em] mb-3">VERIFICATION REQUIRED</p>
          <h1 className="heading-display text-3xl text-cyan-100 mb-4">Check Your Email</h1>

          <p className="text-slate-300 mb-6">
            We've sent a confirmation link to <strong>{email}</strong>. Please click the link in the email to verify your account.
          </p>

          <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400">
              <strong>Didn't receive an email?</strong> Check your spam folder or click the button below to register again.
            </p>
          </div>

          <button
            onClick={() => {
              setShowVerificationPending(false);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="w-full rounded-lg px-4 py-3 border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25 mb-3"
          >
            REGISTER AGAIN
          </button>

          <p className="text-xs text-slate-500">
            Already verified? <Link to="/login" className="text-cyan-300 hover:text-cyan-100">Login here</Link>
          </p>
        </div>
      </section>
    );
  }

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

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg px-4 py-3 border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"
          >
            {submitting ? 'PROVISIONING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-300">
          Already have an account? <Link className="text-cyan-300 hover:text-cyan-100" to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}
