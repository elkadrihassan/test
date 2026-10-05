import { useLayoutEffect, useRef } from 'react';
import { Compass, Feather, Gem, Tent, Wind } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { gsap } from '../lib/motion';
import type { MediaId } from '../data/media';
import { Media } from './Media';
import { Reveal, Words } from './ui';

const CARDS: { media: MediaId; Icon: typeof Compass }[] = [
  { media: 'nomadism', Icon: Compass },
  { media: 'musicPoetry', Icon: Feather },
  { media: 'craft', Icon: Gem },
  { media: 'fantasia', Icon: Wind },
  { media: 'nomadLife', Icon: Tent },
];

/** Pinned horizontal story on desktop; native swipe + snap on touch / reduced motion. */
export function Heritage() {
  const { t, lang, dir } = useLang();
  const pin = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const w = wrap.current!;
      const tr = track.current!;
      const sign = dir === 'rtl' ? 1 : -1;
      const dist = () => Math.max(0, tr.offsetWidth - w.clientWidth);
      w.style.overflow = 'hidden';
      gsap.set(tr, { x: 0 });
      gsap.to(tr, {
        x: () => sign * dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin.current,
          start: 'top top',
          end: () => '+=' + dist() * 1.05,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => bar.current && (bar.current.style.transform = `scaleX(${self.progress})`),
        },
      });
      // each card's photo drifts against the scroll for depth
      tr.querySelectorAll<HTMLElement>('[data-drift]').forEach((n) => {
        gsap.fromTo(n, { xPercent: -6 * sign }, { xPercent: 6 * sign, ease: 'none', scrollTrigger: { trigger: pin.current, start: 'top top', end: () => '+=' + dist() * 1.05, scrub: true, invalidateOnRefresh: true } });
      });
      return () => {
        w.style.overflow = '';
      };
    });
    return () => mm.revert();
  }, [lang, dir]);

  return (
    <section id="patrimoine" className="relative bg-ink-2">
      <div ref={pin} className="relative flex min-h-screen flex-col justify-center overflow-hidden py-24 lg:h-screen lg:py-0">
        <div ref={wrap} className="no-scrollbar snap-x snap-mandatory scroll-px-5 overflow-x-auto scroll-smooth lg:snap-none lg:scroll-auto">
          <ul ref={track} className="flex w-max items-stretch gap-4 px-5 md:gap-6 md:px-10 lg:pe-[10vw]">
            <li className="flex w-[84vw] shrink-0 snap-start flex-col justify-center pe-4 sm:w-[60vw] lg:w-[34vw] lg:pe-10">
              <Reveal y={14}>
                <p className="eyebrow text-brass">{t.heritage.kicker}</p>
              </Reveal>
              <Words as="h2" text={t.heritage.title} className="h-display mt-6 text-[clamp(2.6rem,6vw,5.4rem)]" />
              <Reveal as="p" delay={0.2} className="mt-8 flex items-center gap-4 text-xs tracking-[0.3em] text-ivory/50">
                <span className="h-px w-12 bg-brass" aria-hidden="true" />
                {t.heritage.hint}
              </Reveal>
            </li>
            {t.heritage.cards.map((c, i) => {
              const { media, Icon } = CARDS[i];
              return (
                <li key={i} className="group relative h-[68svh] min-h-[420px] w-[78vw] shrink-0 snap-center overflow-hidden bg-ink sm:w-[56vw] lg:h-[72vh] lg:w-[30vw]">
                  <div data-drift className="absolute -inset-x-[8%] inset-y-0">
                    <div className="tile-media h-full w-full">
                      <Media id={media} alt={c.title} className="h-full w-full" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                  <div className="absolute inset-0 border border-white/10 transition-colors duration-700 group-hover:border-brass/60" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6 md:p-8">
                    <span className="font-display text-sm tracking-[0.3em] text-sand/80" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-ink/30 text-sand backdrop-blur-md transition-all duration-700 group-hover:rotate-[360deg] group-hover:bg-terracotta group-hover:text-ivory">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <h3 className="h-display text-[clamp(2rem,3.4vw,3.2rem)] text-ivory">{c.title}</h3>
                    <p className="mt-3 max-w-sm translate-y-3 text-[0.95rem] leading-relaxed text-ivory/75 opacity-90 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">{c.text}</p>
                    <span className="mt-6 block h-px w-12 origin-left bg-brass transition-transform duration-700 group-hover:scale-x-[3]" />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mx-5 mt-10 hidden h-px bg-white/10 md:mx-10 lg:block" aria-hidden="true">
          <div ref={bar} className="h-full origin-[var(--o)] bg-brass" style={{ ['--o' as string]: dir === 'rtl' ? 'right' : 'left', transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  );
}
