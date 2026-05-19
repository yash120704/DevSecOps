import { motion } from 'framer-motion';
import { Clock3, ExternalLink, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function riskClass(score) {
  if (score >= 90) return 'risk-low';
  if (score >= 70) return 'risk-medium';
  return 'risk-high';
}

export default function Dashboard() {
  const [repoUrl, setRepoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [recentReports, setRecentReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReports = async () => {
      try {
        const { data } = await api.get('/reports/?limit=8');
        setRecentReports(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load recent scans');
      } finally {
        setLoadingReports(false);
      }
    };

    loadReports();
  }, []);

  const onStartScan = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/scan/', { repo_url: repoUrl });
      navigate(`/scan/${data.scan_id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to start scan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-7 mb-7"
      >
        <p className="text-xs text-cyan-300 tracking-[0.2em] mb-2">AUTHENTICATED SCANNER</p>
        <h1 className="heading-display text-3xl md:text-5xl text-cyan-100 mb-3">DevSecOps Dashboard</h1>
        <p className="text-slate-300 max-w-2xl">
          Submit a repository URL to initiate a full CI hygiene, code quality, security, and governance scan.
        </p>

        <form onSubmit={onStartScan} className="mt-6 grid md:grid-cols-[1fr_auto] gap-3">
          <input
            type="url"
            required
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repository"
            disabled={submitting}
            className="w-full rounded-lg px-4 py-3 bg-black/60 border border-cyan-500/30 focus:border-cyan-300 outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg px-6 py-3 border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"
          >
            {submitting ? 'INITIATING...' : 'Start Scan'}
          </button>
        </form>

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </motion.div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-display text-2xl text-cyan-100">Recent Reports</h2>
          <Link to="/history" className="text-cyan-300 hover:text-cyan-100 text-sm">View full history</Link>
        </div>

        {loadingReports ? (
          <p className="text-slate-400">Loading reports...</p>
        ) : recentReports.length === 0 ? (
          <p className="text-slate-400">No scans yet. Start your first scan above.</p>
        ) : (
          <div className="space-y-3">
            {recentReports.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-cyan-500/20 bg-black/40 p-4 grid md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center"
              >
                <div>
                  <p className="font-semibold text-cyan-100">{item.repo_name || 'Unknown Repo'}</p>
                  <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1">
                    <Clock3 size={12} />
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <p className={`font-semibold text-lg ${riskClass(Number(item.compliance_score || 0))}`}>
                  {Math.round(Number(item.compliance_score || 0))}%
                </p>
                <p className="text-sm text-slate-300 inline-flex items-center gap-1">
                  <ShieldAlert size={14} />
                  {(item.risk_level || 'unknown').toUpperCase()}
                </p>
                <Link to={`/report/${item.id}`} className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100">
                  Open Report <ExternalLink size={14} />
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
