import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TerminalLog({ seedLines = [], status }) {
  const lines = useMemo(() => {
    const defaults = [
      '[INIT] Cloning repository...',
      '[CI] Checking workflow files...',
      '[SEC] Running dependency vulnerability checks...',
      '[QA] Evaluating cyclomatic complexity...',
      '[GOV] Validating commit convention history...',
      '[SCORE] Aggregating weighted module scores...'
    ];
    return seedLines.length > 0 ? seedLines : defaults;
  }, [seedLines]);

  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= lines.length) {
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [lines]);

  return (
    <div className="glass-panel rounded-xl p-5 h-80 overflow-auto custom-scroll font-mono text-sm">
      <AnimatePresence>
        {lines.slice(0, visibleCount).map((line) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-2 text-cyan-100"
          >
            <span className="text-cyan-400 mr-2">$</span>
            {line}
          </motion.p>
        ))}
      </AnimatePresence>
      <p className="text-xs mt-4 text-slate-400">
        STATUS: <span className="uppercase text-cyan-300">{status || 'pending'}</span>
      </p>
    </div>
  );
}
