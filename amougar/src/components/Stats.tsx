import { useLayoutEffect, useRef } from 'react';
import { useLang } from '../i18n/LangContext';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { Reveal } from './ui';

export function Stats() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-count]').forEach((node) => {
        const target = Number(node.dataset.count);
        const o = { v: 0 };
        gsap.to(o, {
          v: target,
          duration: target > 50 ? 2.4 : 1.4,
          ease: 'power3.out',
          onUpdate: () => (node.textContent = String(Math.round(o.v))),
          scrollTrigger: { trigger: node, start: 'top 90%', once: true },
        });
      });
      gsap.fromTo('.stat-ring', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-label={t.stats.title} className="relative overflow-hidden bg-ink py-24 md:py-36">
      <svg className="stat-ring pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-60" viewBox="0 0 800 800" aria-hidden="true">
        {[380, 300, 220, 140].map((r, i) => (
          <circle key={r} cx="400" cy="400" r={r} fill="none" stroke="#b8975a" strokeOpacity={0.14 - i * 0.025} />
        ))}
      </svg>
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <dl className="grid grid-cols-2 gap-y-16 lg:grid-cols-4">
          {t.stats.items.map((s, i) => (
            <Reveal key={i} delay={i * 0.08} className="relative px-2 text-center lg:px-8 lg:[&:not(:first-child)]:border-s lg:[&:not(:first-child)]:border-white/10">
              <dd className="font-display leading-none text-sand" style={{ fontSize: 'clamp(3.4rem, 9vw, 8rem)' }} dir="ltr">
                <span data-count={s.n}>{prefersReducedMotion() ? s.n : 0}</span>
                <span className="text-terracotta">{s.suffix}</span>
              </dd>
              <dt className="mx-auto mt-5 max-w-[16ch] text-xs font-medium uppercase leading-relaxed tracking-[0.2em] text-ivory/60 sm:text-[0.78rem]">{s.label}</dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
