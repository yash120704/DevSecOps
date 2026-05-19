import { useRef } from 'react';

export default function ModuleCard({ title, weight, description, icon: Icon, score }) {
  const cardRef = useRef(null);

  const onMove = (event) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 12;
    const rotateX = (0.5 - y) * 12;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const onLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    }
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="glass-panel rounded-xl p-5 transition-transform duration-150"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {Icon ? <Icon className="text-cyan-300" size={20} /> : null}
          <h3 className="heading-display text-base text-cyan-100">{title}</h3>
        </div>
        <span className="text-xs text-slate-300">{weight}%</span>
      </div>
      {typeof score === 'number' ? (
        <p className="text-xl font-semibold text-cyan-200 mb-2">{Math.round(score)}%</p>
      ) : null}
      <p className="text-sm text-slate-300 mb-3">{description}</p>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-lime-400" style={{ width: `${score || 0}%` }} />
      </div>
    </article>
  );
}
