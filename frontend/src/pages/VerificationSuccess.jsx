import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, LogIn, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import supabaseClient from '../services/supabaseClient';

export default function VerificationSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Check if redirected from Supabase with email verification
        const type = searchParams.get('type');
        const token = searchParams.get('token');

        if (type === 'signup' && token) {
          // Supabase has already handled the verification
          // The user session might be created automatically
          // Check current session
          const { data } = await supabaseClient.auth.getSession();
          if (data?.session) {
            // User is verified and has a valid session
            setVerified(true);
          } else {
            // Token in URL but no session created
            // This means the link might be expired or invalid
            setError('Email verification link expired or invalid');
          }
        } else {
          setError('Invalid verification link');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Error verifying email');
      } finally {
        setLoading(false);
      }
    };

    handleVerification();
  }, [searchParams]);

  if (loading) {
    return (
      <section className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 py-10">
        <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center">
          <p className="text-cyan-300">Verifying email...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 py-10">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          {verified ? (
            <div className="p-4 rounded-full bg-lime-500/20 border border-lime-500/40">
              <CheckCircle2 size={40} className="text-lime-300 animate-pulse" />
            </div>
          ) : (
            <div className="p-4 rounded-full bg-rose-500/20 border border-rose-500/40">
              <CheckCircle2 size={40} className="text-rose-300" />
            </div>
          )}
        </div>

        {verified ? (
          <>
            <p className="text-xs text-lime-300 tracking-[0.2em] mb-3">SUCCESS</p>
            <h1 className="heading-display text-3xl text-lime-100 mb-4">Email Verified!</h1>
            <p className="text-slate-300 mb-8">
              Your email has been successfully confirmed. You can now log in to your account.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-lime-300 bg-lime-500/15 text-lime-100 hover:bg-lime-500/25 transition-all w-full justify-center"
            >
              <LogIn size={16} />
              Continue to Login
            </button>

            <p className="mt-4 text-xs text-slate-500">
              or go to <button onClick={() => navigate('/')} className="text-cyan-300 hover:text-cyan-100">home page</button>
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-rose-300 tracking-[0.2em] mb-3">VERIFICATION FAILED</p>
            <h1 className="heading-display text-3xl text-rose-100 mb-4">Verification Error</h1>
            <p className="text-slate-300 mb-6">{error}</p>
            <p className="text-sm text-slate-400 mb-8">
              The verification link may have expired. Please register again or contact support.
            </p>

            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25 transition-all w-full justify-center"
            >
              Register Again
            </button>
          </>
        )}

        <p className="mt-6 text-xs text-slate-500">
          Already have an account? <button onClick={() => navigate('/login')} className="text-cyan-300 hover:text-cyan-100">Login</button>
        </p>
      </div>
    </section>
  );
}
