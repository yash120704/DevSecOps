import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 py-10">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md">
        <p className="text-xs text-cyan-300 tracking-[0.2em] mb-3">AUTH ACCESS</p>
        <h1 className="heading-display text-3xl text-cyan-100 mb-7">LOGIN</h1>

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
              placeholder="********"
            />
          </label>

          {error ? <p className="text-sm text-rose-300 border border-rose-500/40 rounded-lg px-3 py-2">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg px-4 py-3 border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"
          >
            {submitting ? 'AUTHENTICATING...' : 'ENTER CONTROL ROOM'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-300">
          Need an account? <Link className="text-cyan-300 hover:text-cyan-100" to="/register">Register</Link>
        </p>
      </div>
    </section>
  );
}
