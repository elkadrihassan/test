import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { content, DIRS, LANGS, type Dict, type Lang } from './content';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion';

interface Ctx {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: Dict;
  setLang: (l: Lang) => void;
}
const LangCtx = createContext<Ctx>(null as never);
export const useLang = () => useContext(LangCtx);

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && (LANGS as string[]).includes(q)) return q as Lang;
    const s = localStorage.getItem('amougar-lang');
    if (s && (LANGS as string[]).includes(s)) return s as Lang;
  } catch {
    /* storage unavailable */
  }
  return 'fr';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const curtain = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const t = content[lang];
  const dir = DIRS[lang];

  // Keep <html> in sync *before* paint so direction never flashes.
  useLayoutEffect(() => {
    const h = document.documentElement;
    h.lang = lang;
    h.dir = dir;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
    try {
      localStorage.setItem('amougar-lang', lang);
    } catch {
      /* ignore */
    }
  }, [lang, dir, t]);

  // Direction change moves every layout: re-measure scroll triggers.
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    return () => cancelAnimationFrame(id);
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang || busy.current) return;
      const el = curtain.current;
      if (!el || prefersReducedMotion()) {
        setLangState(next);
        return;
      }
      busy.current = true;
      gsap
        .timeline({ onComplete: () => void (busy.current = false) })
        .set(el, { yPercent: 0, y: '100%', transformOrigin: 'bottom' })
        .to(el, { y: '0%', duration: 0.55, ease: 'power4.inOut' })
        .add(() => setLangState(next))
        .fromTo(el.firstElementChild, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.1')
        .to({}, { duration: 0.25 })
        .to(el, { y: '-100%', duration: 0.65, ease: 'power4.inOut' });
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, dir, t, setLang }), [lang, dir, t, setLang]);
  return (
    <LangCtx.Provider value={value}>
      {children}
      <div ref={curtain} className="curtain" aria-hidden="true">
        <span className="font-display text-4xl tracking-[0.3em] text-sand">{content[lang].hero.title}</span>
      </div>
    </LangCtx.Provider>
  );
}
