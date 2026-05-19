import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TerminalLog from '../components/TerminalLog';
import useScanPoller from '../hooks/useScanPoller';

export default function ScanStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, error } = useScanPoller(id, 2000);

  const status = (data?.scan_status || data?.status || 'pending').toLowerCase();

  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => navigate(`/report/${id}`), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status, id, navigate]);

  const logs = [
    '[BOOT] Creating isolated scan sandbox...',
    '[GIT] Cloning remote repository objects...',
    '[CI] Evaluating workflow definitions and test strategy...',
    '[SAST] Checking hardcoded secrets and vulnerable dependencies...',
    '[QA] Mapping code complexity and large-file hotspots...',
    '[GOV] Auditing licensing and commit hygiene...',
    '[SCORE] Computing weighted compliance index...',
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="glass-panel rounded-2xl p-7 mb-6">
        <p className="text-xs tracking-[0.2em] text-cyan-300 mb-3">SCAN PIPELINE</p>
        <h1 className="heading-display text-2xl md:text-4xl text-cyan-100 mb-6">ANALYZING REPOSITORY</h1>

        <div className="flex flex-col md:flex-row gap-8 md:items-center">
          <div className="loader-hex" />
          <div>
            <p className="text-lg text-cyan-200">SCANNING</p>
            <p className="text-slate-400 mt-2">scan id: <span className="text-slate-200">{id}</span></p>
            <p className="mt-2 text-sm uppercase text-cyan-300">status: {status}</p>
            {error ? <p className="mt-2 text-rose-300">{error}</p> : null}
          </div>
        </div>
      </div>

      <TerminalLog seedLines={logs} status={status} />
    </section>
  );
}
