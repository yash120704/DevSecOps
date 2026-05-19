import { motion } from 'framer-motion';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function riskClass(score) {
  if (score >= 90) return 'risk-low';
  if (score >= 70) return 'risk-medium';
  return 'risk-high';
}

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reports/?limit=10');
        setReports(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-cyan-300">Fetching history...</div>;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="glass-panel rounded-2xl p-6">
        <h1 className="heading-display text-3xl text-cyan-100 mb-5">SCAN HISTORY</h1>
        {error ? <p className="text-rose-300 mb-4">{error}</p> : null}

        {reports.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-cyan-300 font-semibold">$ No scans yet. Start scanning -&gt;</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-xl border border-cyan-500/15 bg-black/35 p-4 grid md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center"
              >
                <div>
                  <p className="text-cyan-100 font-semibold">{item.repo_name || 'Unknown Repo'}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <p className={`text-lg font-semibold ${riskClass(Number(item.compliance_score || 0))}`}>
                  {Math.round(Number(item.compliance_score || 0))}%
                </p>
                <p className="text-sm text-slate-300 inline-flex items-center gap-1">
                  <ShieldAlert size={14} />
                  {(item.risk_level || 'unknown').toUpperCase()}
                </p>
                <Link to={`/report/${item.id}`} className="justify-self-start md:justify-self-end inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100">
                  View Report <ExternalLink size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
