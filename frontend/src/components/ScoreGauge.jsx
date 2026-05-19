import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function ScoreGauge({ score = 0 }) {
  const normalized = Number.isFinite(Number(score)) ? Number(score) : 0;
  const color = normalized >= 90 ? '#39ff14' : normalized >= 70 ? '#ffb700' : '#ff2d55';

  return (
    <div className="w-40 h-40">
      <motion.div initial={{ rotate: -120 }} animate={{ rotate: 0 }} transition={{ duration: 1.5, ease: 'easeOut' }}>
        <CircularProgressbar
          value={normalized}
          text={`${Math.round(normalized)}%`}
          styles={buildStyles({
            pathColor: color,
            trailColor: 'rgba(255,255,255,0.08)',
            textColor: '#e8ecff',
            textSize: '18px',
          })}
        />
      </motion.div>
    </div>
  );
}
