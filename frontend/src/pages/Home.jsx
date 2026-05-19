import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeatureCards from '../components/FeatureCards';
import GlitchText from '../components/GlitchText';
import HowItWorks from '../components/HowItWorks';
import MockReportCard from '../components/MockReportCard';
import NetworkGraph from '../components/NetworkGraph';
import StatsBar from '../components/StatsBar';

const terminalLines = [
  '[INIT] Cloning github.com/example/awesome-api',
  '[CI] Workflow and test matrix validated',
  '[SEC] npm audit found 2 moderate vulnerabilities',
  '[GOV] Missing LICENSE file detected',
  '[SCORE] Final compliance score: 84/100 (MEDIUM)',
];

const glitchWords = ['Enforce.', 'Comply.', 'Secure.'];

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(1);

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % glitchWords.length);
    }, 2400);

    const lineTimer = setInterval(() => {
      setLineIndex((prev) => (prev % terminalLines.length) + 1);
    }, 1100);

    return () => {
      clearInterval(wordTimer);
      clearInterval(lineTimer);
    };
  }, []);

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden py-[120px]">
        <div className="absolute inset-0 -z-10">
          <Canvas camera={{ position: [0, 0, 9], fov: 60 }}>
            <NetworkGraph phase="idle" />
          </Canvas>
        </div>

        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p className="text-cyan-300 text-xs tracking-[0.24em] mb-5">[ POLICY-AS-CODE PLATFORM ]</p>
            <div className="mb-5">
              <GlitchText text="Scan. Detect." className="text-5xl md:text-7xl neon-text leading-[0.95]" />
              <motion.h2
                key={glitchWords[wordIndex]}
                initial={{ opacity: 0.2, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="heading-display text-4xl md:text-6xl text-cyan-100 mt-2"
              >
                {glitchWords[wordIndex]}
              </motion.h2>
            </div>

            <p className="text-slate-300 max-w-xl leading-relaxed mb-8">
              Automated CI/CD hygiene, security vulnerability scanning, and governance compliance - for every GitHub repository your team ships.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="px-6 py-3 rounded-lg border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25">
                Start Scanning Free -&gt;
              </Link>
              <button
                type="button"
                onClick={scrollToDemo}
                className="px-6 py-3 rounded-lg border border-slate-500/50 text-slate-200 hover:border-cyan-400"
              >
                See a Live Report -&gt;
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-lime-400" />
              <span className="text-xs text-slate-400 ml-2">scan-session.log</span>
            </div>
            <div className="h-56 overflow-hidden font-mono text-sm space-y-2">
              {terminalLines.slice(0, lineIndex).map((line) => (
                <motion.p key={line} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="text-cyan-100">
                  <span className="text-cyan-400 mr-2">$</span>{line}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StatsBar />
      <FeatureCards />
      <HowItWorks />
      <MockReportCard />

      <section id="docs" className="py-[120px] bg-black/40 border-t border-cyan-500/15">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="heading-display text-4xl text-cyan-100">Your repo has secrets. Find them.</h2>
          <p className="text-slate-300 mt-4">Free to use. No credit card. Just paste a GitHub URL.</p>
          <Link to="/register" className="inline-block mt-8 px-7 py-4 rounded-lg border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25">
            Create Free Account -&gt;
          </Link>

          <div className="mt-16 pt-8 border-t border-cyan-500/20 flex flex-wrap justify-center gap-5 text-sm text-slate-400">
            <span className="heading-display text-cyan-200">[DSP]</span>
            <span>Built with Django + React</span>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-300">GitHub</a>
            <span>MIT License</span>
          </div>
        </div>
      </section>
    </div>
  );
}
