import { useEffect, useLayoutEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { useReady } from '../lib/ready';
import { Media } from './Media';
import { Btn, Words } from './ui';

export function Hero() {
  const { t, lang } = useLang();
  const ready = useReady();
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  // Scroll parallax: each SVG layer drifts at its own speed; text lifts away.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: true };
      el.querySelectorAll<SVGGElement>('svg [data-depth]').forEach((g) => {
        const d = parseFloat(g.dataset.depth || '0');
        gsap.to(g, { y: (0.5 - d) * 700, ease: 'none', scrollTrigger: st });
      });
      gsap.to(content.current, { yPercent: 22, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '70% top' } });
      gsap.to(bg.current, { scale: 1.12, ease: 'none', scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);

  // Cinematic entrance once the loader lifts.
  useEffect(() => {
    const el = root.current;
    if (!ready || !el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-zoom', { scale: 1.35 }, { scale: 1, duration: 3.2, ease: 'expo.out' });
      gsap.fromTo('.hero-fade', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, delay: 0.55, ease: 'power3.out' });
      gsap.fromTo('.hero-line', { scaleX: 0 }, { scaleX: 1, duration: 1.4, delay: 0.9, ease: 'expo.out' });
      gsap.fromTo('.hero-veil', { opacity: 1 }, { opacity: 0, duration: 1.6, ease: 'power2.out' });
    }, el);
    // subtle pointer drift
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let off: (() => void) | undefined;
    if (fine && bg.current) {
      const x = gsap.quickTo(bg.current, 'x', { duration: 1.4, ease: 'power3.out' });
      const y = gsap.quickTo(bg.current, 'y', { duration: 1.4, ease: 'power3.out' });
      const move = (e: PointerEvent) => {
        x((e.clientX / innerWidth - 0.5) * -22);
        y((e.clientY / innerHeight - 0.5) * -14);
      };
      window.addEventListener('pointermove', move, { passive: true });
      off = () => window.removeEventListener('pointermove', move);
    }
    return () => {
      ctx.revert();
      off?.();
    };
  }, [ready]);

  return (
    <section id="home" ref={root} className="relative isolate flex h-[100svh] min-h-[620px] items-center justify-center overflow-hidden bg-ink text-ivory" aria-label={t.hero.title}>
      <div ref={bg} className="absolute -inset-[3%] -z-20">
        <div className="hero-zoom h-full w-full">
          <Media id="hero" eager alt="" className="h-full w-full" />
        </div>
      </div>
      {/* gradient overlays: legibility without flattening the photo */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,rgba(13,11,9,0.05)_0%,rgba(13,11,9,0.55)_70%,rgba(13,11,9,0.85)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-transparent to-ink" />
      <div className="hero-veil pointer-events-none absolute inset-0 -z-10 bg-ink" />

      <div ref={content} className="relative flex w-full max-w-[1400px] flex-col items-center px-5 pb-16 pt-24 text-center md:px-10">
        <p className="hero-fade inline-flex items-center gap-3 rounded-full border border-brass/50 bg-ink/40 px-4 py-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-sand backdrop-blur-md sm:text-[0.7rem]" style={{ opacity: ready ? undefined : 0 }}>
          <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden="true" />
          {t.hero.unesco}
        </p>

        <p className="hero-fade mt-8 text-[0.78rem] font-medium tracking-[0.5em] text-ivory/85 sm:text-sm md:mt-10" style={{ opacity: ready ? undefined : 0 }}>
          {t.hero.kicker}
        </p>

        <h1 className="h-display mt-3 text-[clamp(3.8rem,19vw,15rem)] font-medium leading-[0.9] tracking-[0.04em] text-ivory md:mt-2" style={lang === 'ar' ? { letterSpacing: 0 } : undefined}>
          <Words text={t.hero.title} waitReady className="block" />
        </h1>

        <div className="hero-line mt-6 h-px w-24 origin-center bg-brass md:mt-8 md:w-40" />

        <p className="hero-fade mt-6 font-display text-2xl italic text-sand sm:text-3xl" style={{ opacity: ready ? undefined : 0 }}>
          {t.hero.place}
        </p>
        <p className="hero-fade mt-5 text-[clamp(1.05rem,3.4vw,1.9rem)] font-semibold tracking-[0.22em] text-ivory" style={{ opacity: ready ? undefined : 0 }}>
          {t.hero.dates}
        </p>

        <div className="hero-fade mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4" style={{ opacity: ready ? undefined : 0 }}>
          <Btn href="#moussem" variant="solid">
            {t.hero.cta1}
          </Btn>
          <Btn href="#programme" variant="ghost" arrow={false}>
            {t.hero.cta2}
          </Btn>
        </div>
      </div>

      <a href="#moussem" aria-label={t.hero.scroll} className="hero-fade absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 text-[0.62rem] tracking-[0.35em] text-ivory/60 hover:text-ivory" style={{ opacity: ready ? undefined : 0 }}>
        <span>{t.hero.scroll.toUpperCase()}</span>
        <span className="relative block h-12 w-px overflow-hidden bg-white/20">
          <span className="absolute inset-x-0 top-0 h-5 animate-[scrollcue_1.9s_cubic-bezier(.65,0,.35,1)_infinite] bg-brass" />
        </span>
        <ChevronDown size={14} className="sr-only" />
      </a>
    </section>
  );
}
