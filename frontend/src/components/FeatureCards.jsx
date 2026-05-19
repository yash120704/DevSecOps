import { motion } from 'framer-motion';
import { ChartColumnIncreasing, FileCheck2, ShieldAlert, Workflow } from 'lucide-react';

const features = [
  {
    title: 'CI Hygiene',
    icon: Workflow,
    weight: 30,
    description: 'Detect missing CI configs, absent test suites, and broken build pipelines before they hit production.',
  },
  {
    title: 'Code Quality',
    icon: ChartColumnIncreasing,
    weight: 25,
    description: 'Cyclomatic complexity analysis, static linting via flake8, and large file detection baked in.',
  },
  {
    title: 'Security',
    icon: ShieldAlert,
    weight: 30,
    description: 'Scan for hardcoded secrets, vulnerable dependencies via pip-audit/npm audit, and debug mode leaks.',
  },
  {
    title: 'Governance',
    icon: FileCheck2,
    weight: 15,
    description: 'Enforce README, LICENSE, dependency manifests, and conventional commit message standards.',
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="py-[120px]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="heading-display text-3xl md:text-5xl text-cyan-100 mb-12"
        >
          Everything your repo needs to be production-ready
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="glass-panel rounded-xl p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,245,255,0.7)]" size={20} />
                    <h3 className="heading-display text-xl text-cyan-100">{feature.title}</h3>
                  </div>
                  <span className="text-xs text-slate-300">{feature.weight}% weight</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                <div className="h-1 rounded-full bg-slate-800 mt-5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-lime-400 group-hover:brightness-125"
                    style={{ width: `${feature.weight}%` }}
                  />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
