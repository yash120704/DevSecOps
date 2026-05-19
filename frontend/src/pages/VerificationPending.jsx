import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import useAuth from '../hooks/useAuth';

export default function VerificationPending() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <section className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 py-10">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-cyan-500/20 border border-cyan-500/40">
            <Mail size={40} className="text-cyan-300" />
          </div>
        </div>

        <p className="text-xs text-cyan-300 tracking-[0.2em] mb-3">VERIFICATION REQUIRED</p>
        <h1 className="heading-display text-3xl text-cyan-100 mb-4">Check Your Email</h1>

        <p className="text-slate-300 mb-6">
          We've sent a confirmation link to your email address. Please click the link to verify your email and activate your account.
        </p>

        <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-400">
            <strong>Didn't receive an email?</strong> Check your spam folder or try registering again.
          </p>
        </div>

        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25 transition-all"
        >
          Back to Registration
          <ArrowRight size={16} />
        </Link>

        <p className="mt-6 text-xs text-slate-500">
          Already verified? <Link to="/login" className="text-cyan-300 hover:text-cyan-100">Login here</Link>
        </p>
      </div>
    </section>
  );
}
