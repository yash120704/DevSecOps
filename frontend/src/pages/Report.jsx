import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Download, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModuleCard from '../components/ModuleCard';
import RuleRow from '../components/RuleRow';
import ScoreGauge from '../components/ScoreGauge';
import SecurityRadar from '../components/SecurityRadar';
import api from '../services/api';

const MODULE_LABELS = {
  ci_hygiene: { title: 'CI Hygiene', weight: 30 },
  code_quality: { title: 'Code Quality', weight: 25 },
  security: { title: 'Security', weight: 30 },
  governance: { title: 'Governance', weight: 15 },
};

function getRiskClass(value) {
  const risk = String(value || '').toUpperCase();
  if (risk === 'LOW') return 'risk-low';
  if (risk === 'MEDIUM') return 'risk-medium';
  return 'risk-high';
}

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModule, setOpenModule] = useState('security');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/reports/${id}/`);
        setReport(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const reportData = report?.report_json || {};
  const moduleScores = reportData.module_scores || {};

  const modules = useMemo(() => (
    Object.entries(MODULE_LABELS).map(([key, meta]) => {
      const moduleData = moduleScores[key];
      const score = moduleData?.raw_score ? Math.round(moduleData.raw_score * 100) : 0;
      return {
        key,
        title: meta.title,
        weight: meta.weight,
        score,
        rules: reportData?.[key]?.rules || [],
        details: reportData?.[key]?.details || '',
      };
    })
  ), [moduleScores, reportData]);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan-report-${id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-cyan-300">Loading report...</div>;
  }

  if (error) {
    return <div className="min-h-[60vh] flex items-center justify-center text-rose-300">{error}</div>;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="glass-panel rounded-2xl p-7 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="heading-display text-2xl md:text-4xl text-cyan-100">{report?.repo_name || reportData.repo_name}</h1>
            <a href={report?.repo_url || reportData.repo_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-100">
              {(report?.repo_url || reportData.repo_url) || 'Repository URL'}
              <ExternalLink size={14} />
            </a>
            <p className="text-xs text-slate-400 mt-3">{reportData.timestamp || report?.created_at}</p>
          </div>

          <div className="flex items-center gap-6">
            <ScoreGauge score={Number(report?.compliance_score || reportData.score || 0)} />
            <div>
              <p className="text-xs text-slate-400">RISK LEVEL</p>
              <p className={`text-2xl heading-display ${getRiskClass(report?.risk_level || reportData.risk_level)}`}>
                {(report?.risk_level || reportData.risk_level || 'HIGH').toUpperCase()}
              </p>
              <button onClick={downloadJson} className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-400/40 text-cyan-100 hover:bg-cyan-500/10">
                <Download size={14} />
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-4">
          {modules.map((module) => (
            <button key={module.key} onClick={() => setOpenModule(module.key)} className="w-full text-left">
              <ModuleCard
                title={module.title}
                weight={module.weight}
                score={module.score}
                description={module.details || 'Policy checks and weighted score output.'}
              />
            </button>
          ))}
        </div>

        <div className="glass-panel rounded-2xl p-6">
          {modules.map((module) => (
            <motion.section
              key={module.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: openModule === module.key ? 1 : 0, y: openModule === module.key ? 0 : 8 }}
              className={openModule === module.key ? 'block' : 'hidden'}
            >
              <h2 className="heading-display text-xl text-cyan-100 mb-4">{module.title} Rules</h2>
              <div>
                {module.rules.length === 0 ? (
                  <p className="text-slate-400">No rule data returned for this module.</p>
                ) : (
                  module.rules.map((rule, index) => <RuleRow key={`${module.key}-${index}`} rule={rule} />)
                )}
              </div>
            </motion.section>
          ))}

          <div className="mt-8">
            <p className="text-xs text-cyan-300 tracking-[0.2em] mb-3">SECURITY RADAR</p>
            <div className="h-64 rounded-xl border border-cyan-500/20 bg-black/40">
              <Canvas camera={{ position: [0, 0, 6] }}>
                <SecurityRadar />
              </Canvas>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
