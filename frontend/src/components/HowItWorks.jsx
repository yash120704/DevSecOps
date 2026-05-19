import { motion } from 'framer-motion';

const steps = [
  {
    icon: '🔗',
    title: 'Paste your GitHub URL',
    description: 'Drop in any public or private GitHub repo link',
  },
  {
    icon: '⚙️',
    title: 'Engine scans in real-time',
    description: 'Our policy engine clones, analyzes, and scores across 4 modules',
  },
  {
    icon: '📊',
    title: 'Get your compliance report',
    description: 'Detailed rule-by-rule breakdown with risk level and actionable fixes',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-[120px]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="heading-display text-3xl md:text-5xl text-cyan-100 mb-14"
        >
          From repo URL to compliance report in seconds
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px border-t border-dashed border-cyan-400/50 animate-pulse" />
          {steps.map((step, idx) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="glass-panel rounded-xl p-6 relative"
            >
              <p className="text-3xl mb-3">{step.icon}</p>
              <h3 className="heading-display text-xl text-cyan-100 mb-2">{step.title}</h3>
              <p className="text-slate-300">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
