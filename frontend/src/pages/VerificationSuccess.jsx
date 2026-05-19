import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle2, LogIn, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function VerificationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have the verification parameters
    const type = searchParams.get('type');
    const hasToken = searchParams.has('token');
    
    // Log for debugging
    console.log('Auth callback params:', { type, hasToken, hash: location.hash, search: location.search });

    // Supabase sends type=signup when email is verified
    if (type === 'signup' || type === 'email_change') {
      setVerified(true);
    } else if (location.hash.includes('type=signup') || location.hash.includes('type=email_change')) {
      // Handle hash-based params
      setVerified(true);
    }
    
    setLoading(false);
  }, [searchParams, location]);

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
            <p className="text-xs text-rose-300 tracking-[0.2em] mb-3">VERIFICATION INFO</p>
            <h1 className="heading-display text-3xl text-rose-100 mb-4">Email Link Callback</h1>
            <p className="text-slate-300 mb-6">
              If you were redirected here after clicking an email verification link, your email should now be verified.
            </p>
            <p className="text-sm text-slate-400 mb-8">
              You can now log in with your email and password.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25 transition-all w-full justify-center"
            >
              Go to Login
            </button>
          </>
        )}

        <p className="mt-6 text-xs text-slate-500">
          Back to <button onClick={() => navigate('/register')} className="text-cyan-300 hover:text-cyan-100">register</button> or <button onClick={() => navigate('/')} className="text-cyan-300 hover:text-cyan-100">home</button>
        </p>
      </div>
    </section>
  );
}
