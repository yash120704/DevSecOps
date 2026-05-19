import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function CountUp({ end, suffix = '', duration = 1200 }) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(end * progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [duration, end]);

  return <span className="text-cyan-300">{value}{suffix}</span>;
}

export default function StatsBar() {
  const stats = [
    { label: 'Policy Modules', end: 4, suffix: '' },
    { label: 'Automated Rules', end: 12, suffix: '+' },
    { label: 'Risk Levels', end: 3, suffix: '' },
    { label: 'Scan Time', end: 60, suffix: 's' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="border-y border-cyan-500/20 bg-black/35"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className={`text-center ${index < stats.length - 1 ? 'md:border-r md:border-cyan-500/20' : ''}`}>
            <p className="text-lg md:text-2xl font-semibold heading-display">
              {stat.label === 'Scan Time' ? '< ' : ''}
              <CountUp end={stat.end} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
