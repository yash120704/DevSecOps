import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ScoreGauge from './ScoreGauge';

const moduleRows = [
  { name: 'CI Hygiene', score: 90 },
  { name: 'Code Quality', score: 78 },
  { name: 'Security', score: 80 },
  { name: 'Governance', score: 85 },
];

const rules = [
  { status: 'pass', text: 'README found' },
  { status: 'pass', text: 'CI config detected' },
  { status: 'warn', text: 'No LICENSE file' },
  { status: 'fail', text: 'Hardcoded secret detected' },
];

const statusMap = {
  pass: 'text-lime-400',
  warn: 'text-amber-400',
  fail: 'text-rose-400',
};

const symbolMap = {
  pass: '✅',
  warn: '⚠️',
  fail: '❌',
};

export default function MockReportCard() {
  return (
    <section id="demo" className="py-[120px]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="heading-display text-3xl md:text-5xl text-cyan-100 mb-10"
        >
          What your report looks like
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel rounded-2xl p-7"
        >
          <div className="flex flex-wrap gap-6 justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm">Repo</p>
              <p className="text-cyan-200 font-semibold">github.com/example/awesome-api</p>
              <p className="mt-2 text-amber-300">84 / 100 - Medium Risk</p>
            </div>
            <ScoreGauge score={84} />
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {moduleRows.map((m) => (
              <div key={m.name} className="rounded-lg border border-cyan-500/20 bg-black/35 px-4 py-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{m.name}</span>
                  <span className="text-cyan-300">{m.score}%</span>
                </div>
                <div className="h-1 mt-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-lime-400" style={{ width: `${m.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-2 text-sm">
            {rules.map((rule) => (
              <p key={rule.text} className={`flex items-center gap-2 ${statusMap[rule.status]}`}>
                <span>{symbolMap[rule.status]}</span>
                <span>{rule.text}</span>
              </p>
            ))}
          </div>

          <Link
            to="/register"
            className="mt-8 inline-flex px-5 py-3 rounded-lg border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"
          >
            Get your repo's report -&gt;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
