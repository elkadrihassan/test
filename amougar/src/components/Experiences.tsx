import { useState } from 'react';
import { useLang } from '../i18n/LangContext';
import type { MediaId } from '../data/media';
import { Media } from './Media';
import { Parallax, Reveal, Words } from './ui';

const BG: MediaId[] = ['xpCaravan', 'xpCamp', 'xpMusic', 'xpFantasia', 'xpFood', 'xpMarket'];

/** Full-bleed immersive section: hovering (or focusing / tapping) an experience swaps the world behind it. */
export function Experiences() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  const x = t.experiences;
  return (
    <section id="experiences" className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden bg-ink text-ivory">
      <Parallax className="absolute inset-0 -z-20" amount={5}>
        {BG.map((id, n) => (
          <div key={id} className="absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-[var(--ease-out-expo)]" style={{ opacity: n === i ? 1 : 0, transform: n === i ? 'scale(1)' : 'scale(1.12)' }} aria-hidden={n !== i}>
            <Media id={id} alt="" className="h-full w-full" />
          </div>
        ))}
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/10 to-ink/45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/70 via-transparent to-transparent rtl:bg-gradient-to-l" />

      <div className="mx-auto w-full max-w-[1500px] px-5 pb-8 pt-28 md:px-10 md:pt-40">
        <Reveal y={14}>
          <p className="eyebrow text-sand">{x.kicker}</p>
        </Reveal>
        <Words as="h2" text={x.title} className="h-display mt-6 text-[clamp(3rem,10vw,9.5rem)]" />
        <div key={i} className="anim-fade-up mt-8 max-w-md" aria-live="polite">
          <p className="font-display text-3xl italic text-sand md:text-4xl">{x.items[i].title}</p>
          <p className="mt-3 text-base leading-relaxed text-ivory/80 md:text-lg">{x.items[i].text}</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1500px] px-5 pb-8 md:px-10 md:pb-14">
        <p className="mb-4 text-sm text-ivory/60 md:mb-6">{x.intro}</p>
        <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 xl:grid-cols-6">
          {x.items.map((it, n) => (
            <li key={n}>
              <button
                type="button"
                aria-pressed={n === i}
                onMouseEnter={() => setI(n)}
                onFocus={() => setI(n)}
                onClick={() => setI(n)}
                className={`group relative flex h-full min-h-[5.5rem] w-full flex-col justify-between gap-6 overflow-hidden border p-4 text-start backdrop-blur-md transition-all duration-500 md:min-h-[8.5rem] md:p-5 ${
                  n === i ? 'border-brass bg-ink/60' : 'border-white/15 bg-ink/35 hover:border-white/40'
                }`}
              >
                <span className={`absolute inset-x-0 top-0 h-0.5 origin-left bg-brass transition-transform duration-700 rtl:origin-right ${n === i ? 'scale-x-100' : 'scale-x-0'}`} aria-hidden="true" />
                <span className="text-xs tracking-[0.3em] text-brass" dir="ltr">{String(n + 1).padStart(2, '0')}</span>
                <span className="font-display text-[1.15rem] leading-tight md:text-[1.45rem]">{it.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
