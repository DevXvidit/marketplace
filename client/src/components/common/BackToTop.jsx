import { createPortal } from 'react-dom';

export default function BackToTop() {

  const handleClick = () => {
    const startY = window.scrollY || window.pageYOffset;
    const duration = 1200;
    const start = performance.now();
    const scrollTarget = document.scrollingElement || document.documentElement;

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      const nextY = Math.round(startY * (1 - eased));
      scrollTarget.scrollTop = nextY;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  return createPortal(
    <button
      type="button"
      aria-label="Back to top"
      onClick={handleClick}
      className="group fixed bottom-7 right-7 z-50 rounded-full border border-gold-700/70 bg-luxury-black/85 px-5 py-4 text-gold-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-600 hover:text-gold-400 hover:shadow-[0_12px_34px_rgba(0,0,0,0.6)]"
    >
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: 'inset 0 0 12px rgba(212,175,55,0.12)' }}
      />
      <span className="relative flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.4em]">
        <span className="block">Top</span>
        <svg className="h-4 w-4 -mt-0.5 transition-transform duration-300 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5l-7 7m7-7l7 7" />
          <path d="M12 12l-7 7m7-7l7 7" />
        </svg>
      </span>
    </button>,
    document.body
  );
}
