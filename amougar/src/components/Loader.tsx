import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { useLang } from '../i18n/LangContext';

/** ~2s intro: wordmark rises, hairline fills, place name fades in, curtain lifts. */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const { t, lang } = useLang();
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const letters = el.querySelectorAll('.ld-l > span');
    let tl: gsap.core.Timeline | undefined;
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      if (reduced) {
        tl = gsap.timeline({ onComplete: () => done.current() }).to(el, { opacity: 0, duration: 0.4, delay: 0.2 }).set(el, { display: 'none' });
        return;
      }
      tl = gsap
        .timeline({ onComplete: () => void (el.style.display = 'none') })
        .fromTo(letters, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.06 })
        .fromTo('.ld-line', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.15)
        .fromTo('.ld-place', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.7)
        .to('.ld-inner', { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' }, 1.7)
        .add(() => done.current(), 1.85)
        .to(el, { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, 1.85);
    };
    // Wait for the display fonts so the entrance never swaps typefaces mid-animation (max 1.2s).
    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(run);
    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, []);

  return (
    <div ref={root} className="fixed inset-0 z-[400] grid place-items-center bg-ink text-ivory" role="status" aria-label={t.ui.loading}>
      <div className="ld-inner flex flex-col items-center px-6 text-center">
        <div className="font-display text-[clamp(2.6rem,10vw,6rem)] leading-none tracking-[0.22em]" aria-hidden="true">
          {(lang === 'ar' ? [t.hero.title] : [...t.hero.title]).map((c, i) => (
            <span key={i} className="ld-l word-mask">
              <span>{c}</span>
            </span>
          ))}
        </div>
        <div className="ld-line mt-8 h-px w-48 origin-left bg-brass sm:w-72" />
        <p className="ld-place mt-6 text-[0.7rem] tracking-[0.4em] text-sand">{t.loader.place}</p>
      </div>
    </div>
  );
}
