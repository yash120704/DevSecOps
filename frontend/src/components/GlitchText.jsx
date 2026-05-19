export default function GlitchText({ text, className = '' }) {
  return (
    <h1 className={`relative inline-block heading-display ${className}`} data-text={text}>
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-0 text-cyan-300 glitch-layer-1" aria-hidden>{text}</span>
      <span className="absolute inset-0 text-rose-500 glitch-layer-2" aria-hidden>{text}</span>
      <style>{`
        .glitch-layer-1, .glitch-layer-2 {
          clip-path: polygon(0 2%, 100% 0, 100% 38%, 0 40%);
          animation: glitch-shift 8s infinite;
          opacity: 0.55;
        }
        .glitch-layer-2 {
          clip-path: polygon(0 64%, 100% 60%, 100% 100%, 0 100%);
          animation-delay: 130ms;
        }
        @keyframes glitch-shift {
          0%, 89%, 100% { transform: translate(0, 0); }
          90% { transform: translate(-3px, -1px); }
          92% { transform: translate(2px, 1px); }
          94% { transform: translate(-1px, 2px); }
          96% { transform: translate(1px, -2px); }
          98% { transform: translate(0, 0); }
        }
      `}</style>
    </h1>
  );
}
