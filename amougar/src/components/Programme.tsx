import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Download, MapPin } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { CATEGORIES, EVENTS, VENUES, type Category } from '../data/programme';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { Btn, Reveal, SectionHead } from './ui';

export const CAT_DOT: Record<Category, string> = {
  culture: '#b5532f',
  music: '#7a1f34',
  heritage: '#b8975a',
  sport: '#2f6b57',
  children: '#d49a2c',
  innovation: '#2f4a6b',
  night: '#17130f',
};

export function Programme() {
  const { t, lang, dir } = useLang();
  const p = t.programme;
  const [day, setDay] = useState(0);
  const [cat, setCat] = useState<Category | 'all'>('all');
  const list = useRef<HTMLUListElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const dayEvents = useMemo(() => EVENTS.filter((e) => e.day === day), [day]);
  const shown = useMemo(() => dayEvents.filter((e) => cat === 'all' || e.cat === cat), [dayEvents, cat]);

  // animate rows in whenever the day or filter changes
  useLayoutEffect(() => {
    const el = list.current;
    if (!el || prefersReducedMotion()) return;
    const rows = el.querySelectorAll('li');
    const tw = gsap.fromTo(rows, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out', overwrite: true });
    return () => void tw.kill();
  }, [day, cat]);

  const onKey = (e: KeyboardEvent) => {
    const rtl = dir === 'rtl';
    let next = day;
    if (e.key === 'ArrowRight') next = rtl ? day - 1 : day + 1;
    else if (e.key === 'ArrowLeft') next = rtl ? day + 1 : day - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 4;
    else return;
    e.preventDefault();
    next = Math.max(0, Math.min(4, next));
    setDay(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="programme" className="relative bg-ivory-2 py-28 text-ink md:py-40">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <SectionHead kicker={p.kicker} title={p.title} tone="light" className="lg:col-span-8" />
          <Reveal className="lg:col-span-4 lg:justify-self-end">
            <Btn variant="dark" arrow={false} onClick={() => window.print()} label={p.download}>
              <span className="flex items-center gap-3">
                <Download size={16} aria-hidden="true" />
                {p.download}
              </span>
            </Btn>
          </Reveal>
        </div>

        {/* day tabs */}
        <Reveal className="mt-16">
          <div role="tablist" aria-label={p.days} onKeyDown={onKey} className="grid grid-cols-5 border-y border-ink/15">
            {p.dayLabels.map((label, i) => {
              const [num, ...mon] = label.split(' ');
              const sel = i === day;
              return (
                <button
                  key={i}
                  ref={(el) => void (tabs.current[i] = el)}
                  role="tab"
                  id={`day-tab-${i}`}
                  aria-selected={sel}
                  aria-controls="day-panel"
                  tabIndex={sel ? 0 : -1}
                  onClick={() => setDay(i)}
                  className={`group relative flex flex-col items-center gap-0.5 px-1 py-4 transition-colors duration-500 md:py-7 ${sel ? 'text-ivory' : 'text-ink/60 hover:text-ink'}`}
                >
                  <span aria-hidden="true" className={`absolute inset-0 -z-0 origin-bottom bg-ink transition-transform duration-[600ms] ease-[var(--ease-out-expo)] ${sel ? 'scale-y-100' : 'scale-y-0'}`} />
                  <span className="relative font-display text-[clamp(1.7rem,5vw,3.6rem)] leading-none" dir="ltr">{num}</span>
                  <span className="relative text-[0.6rem] font-semibold tracking-[0.2em] sm:text-xs">{mon.join(' ')}</span>
                  <span className="relative mt-1 hidden text-[0.68rem] tracking-[0.14em] opacity-70 md:block">{p.weekdays[i]}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* category filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2.5" role="group" aria-label={p.filter}>
          {(['all', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
                cat === c ? 'border-ink bg-ink text-ivory' : 'border-ink/20 text-ink/70 hover:border-ink/60'
              }`}
            >
              {c !== 'all' && <span className="h-2 w-2 rounded-full" style={{ background: CAT_DOT[c], boxShadow: c === 'night' ? '0 0 0 1px rgb(244 236 220 / .6)' : undefined }} aria-hidden="true" />}
              {c === 'all' ? p.all : p.cats[c]}
            </button>
          ))}
          <span className="ms-auto text-xs tracking-wide text-ink/50" aria-live="polite">
            {p.count(shown.length)}
          </span>
        </div>

        {/* events */}
        <div id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`} className="mt-6 min-h-[28rem]">
          <div className="hidden grid-cols-[7rem_1fr_14rem_10rem] gap-6 border-b border-ink/15 pb-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink/45 md:grid">
            <span>{p.time}</span>
            <span>{p.activity}</span>
            <span>{p.location}</span>
            <span>{p.category}</span>
          </div>
          {shown.length === 0 ? (
            <p className="py-20 text-center font-display text-2xl text-ink/50">{p.empty}</p>
          ) : (
            <ul ref={list}>
              {shown.map((e) => (
                <li key={`${e.day}-${e.time}`} className="group relative grid grid-cols-[4.6rem_1fr] items-baseline gap-x-5 gap-y-2 border-b border-ink/15 py-6 transition-colors duration-500 hover:bg-ink/[0.03] md:grid-cols-[7rem_1fr_14rem_10rem] md:gap-6 md:py-8">
                  <span className="absolute inset-y-0 start-0 w-0 bg-terracotta transition-[width] duration-500 group-hover:w-1" aria-hidden="true" />
                  <time className="font-display text-[1.7rem] leading-none text-terracotta md:text-[2.4rem]" dir="ltr">{e.time}</time>
                  <h3 className="font-display text-[1.35rem] leading-snug md:text-[1.9rem]">{e.title[lang]}</h3>
                  <p className="col-start-2 flex items-center gap-2 text-sm text-ink/65 md:col-start-auto">
                    <MapPin size={15} className="shrink-0 text-ink/40" aria-hidden="true" />
                    {VENUES[e.venue][lang]}
                  </p>
                  <p className="col-start-2 flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink/70 md:col-start-auto">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CAT_DOT[e.cat] }} aria-hidden="true" />
                    {p.cats[e.cat]}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-6 text-xs text-ink/45">{p.note}</p>
      </div>

      {/* Full programme — shown only when printing / saving as PDF */}
      <div className="print-only" lang={lang} dir={dir}>
        <h1 style={{ fontSize: '24pt', marginBottom: '4pt' }}>{p.printTitle}</h1>
        <p style={{ marginBottom: '16pt' }}>{t.hero.dates} · {t.hero.place}</p>
        {p.dayLabels.map((label, i) => (
          <section key={i} style={{ marginBottom: '14pt', breakInside: 'avoid' }}>
            <h2 style={{ fontSize: '15pt', borderBottom: '1px solid #000', marginBottom: '6pt' }}>
              {p.weekdays[i]} — {label}
            </h2>
            {EVENTS.filter((e) => e.day === i).map((e) => (
              <p key={e.time} style={{ margin: '3pt 0' }}>
                <b>{e.time}</b> · {e.title[lang]} — {VENUES[e.venue][lang]} ({p.cats[e.cat]})
              </p>
            ))}
          </section>
        ))}
        <p style={{ fontSize: '9pt', marginTop: '20pt' }}>{p.note}</p>
      </div>
    </section>
  );
}
