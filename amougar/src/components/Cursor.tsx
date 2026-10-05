import { useEffect, useRef } from 'react';
import { gsap } from '../lib/motion';
import { useLang } from '../i18n/LangContext';

/** Small dot → "VIEW" on imagery → grows on links. Fine pointers only. */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.documentElement.classList.add('has-cursor');
    const x = gsap.quickTo(el, 'x', { duration: 0.28, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.28, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      if (el.style.opacity === '0') {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        el.style.opacity = '1';
      }
      x(e.clientX);
      y(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const view = !!target?.closest('[data-cursor="view"]');
      const link = !view && !!target?.closest('a,button,input,select,summary,[role="tab"],[role="button"],[data-cursor="link"]');
      el.classList.toggle('is-view', view);
      el.classList.toggle('is-link', link);
    };
    const hide = () => (el.style.opacity = '0');
    const show = () => (el.style.opacity = '1');
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('pointerleave', hide);
    document.addEventListener('pointerenter', show);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.removeEventListener('pointerleave', hide);
      document.removeEventListener('pointerenter', show);
    };
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden="true" style={{ opacity: 0 }}>
      <div className="cursor-dot">
        <span>{t.ui.view}</span>
      </div>
    </div>
  );
}
