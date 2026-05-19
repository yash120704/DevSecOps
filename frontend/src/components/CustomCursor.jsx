import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [variant, setVariant] = useState('default');

  useEffect(() => {
    const onMove = (event) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
    };

    const onOver = (event) => {
      const interactive = event.target.closest('button, a, input, textarea, [role="button"]');
      if (!interactive) {
        setVariant('default');
        return;
      }
      if (interactive.className?.toString().toLowerCase().includes('red')) {
        setVariant('danger');
      } else {
        setVariant('hover');
      }
    };

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.18;
      current.current.y += (target.current.y - current.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    const raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  const palette = variant === 'danger'
    ? 'rgba(255,45,85,0.95)'
    : 'rgba(0,245,255,0.95)';
  const scale = variant === 'default' ? 1 : 1.5;

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 10000,
        color: palette,
        transform: 'translate3d(-100px, -100px, 0)',
        transition: 'color 160ms ease, filter 160ms ease',
        filter: `drop-shadow(0 0 8px ${palette})`,
      }}
      aria-hidden
    >
      <svg width={24 * scale} height={24 * scale} viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}
