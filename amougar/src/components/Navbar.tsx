import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { LANGS, type Lang } from '../i18n/content';
import { gsap, prefersReducedMotion, scrollToTarget, smooth } from '../lib/motion';
import { useReady } from '../lib/ready';
import { Btn } from './ui';

export const NAV: { id: string; key: 'home' | 'moussem' | 'programme' | 'heritage' | 'experiences' | 'gallery' | 'news' | 'contact' }[] = [
  { id: 'home', key: 'home' },
  { id: 'moussem', key: 'moussem' },
  { id: 'programme', key: 'programme' },
  { id: 'patrimoine', key: 'heritage' },
  { id: 'experiences', key: 'experiences' },
  { id: 'galerie', key: 'gallery' },
  { id: 'actualites', key: 'news' },
  { id: 'contact', key: 'contact' },
];

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <a
      href="#home"
      onClick={(e) => {
        e.preventDefault();
        scrollToTarget(0);
        onClick?.();
      }}
      className="group flex items-center gap-3"
      aria-label="AMOUGAR — Tan-Tan"
    >
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" className="transition-transform duration-700 group-hover:rotate-[20deg]">
        <circle cx="16" cy="16" r="15" fill="none" stroke="#b8975a" strokeWidth="1" />
        <circle cx="16" cy="13" r="4.5" fill="#b5532f" />
        <path d="M3 22c4-5 8-6 13-2s9 3 13-2v6a14 14 0 0 1-26 0z" fill="#d8c3a0" />
      </svg>
      <span className="font-display text-[1.55rem] font-semibold leading-none tracking-[0.2em]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        AMOUGAR
      </span>
    </a>
  );
}

export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t.ui.langLabel} className={`flex items-center gap-1 text-[0.72rem] font-semibold tracking-[0.18em] ${className}`} dir="ltr">
      {LANGS.map((l: Lang, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden="true" className="opacity-30">|</span>}
          <button
            type="button"
            lang={l}
            aria-pressed={l === lang}
            onClick={() => setLang(l)}
            className={`rounded px-1.5 py-1 uppercase transition-colors hover:text-sand ${l === lang ? 'text-brass' : 'text-ivory/70'}`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}

export function Navbar() {
  const { t } = useLang();
  const ready = useReady();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const bar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // glass bar on scroll
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // active section highlight
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  // entrance
  useEffect(() => {
    if (!ready || prefersReducedMotion() || !bar.current) return;
    gsap.fromTo(bar.current, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: 0.3 });
  }, [ready]);

  // mobile menu: lock scroll, stagger links, Esc to close, return focus
  useEffect(() => {
    const m = menu.current;
    if (!m) return;
    if (open) {
      smooth.lenis?.stop();
      document.documentElement.style.overflow = 'hidden';
      if (!prefersReducedMotion()) {
        gsap.fromTo(m, { clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' }, { clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)', duration: 0.9, ease: 'expo.inOut' });
        gsap.fromTo(m.querySelectorAll('[data-m]'), { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, delay: 0.35, ease: 'power3.out' });
      }
      m.querySelector<HTMLElement>('a')?.focus();
      const esc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
        if (e.key === 'Tab') {
          const f = [...m.querySelectorAll<HTMLElement>('a,button')].concat(toggle.current ? [toggle.current] : []);
          const first = f[0];
          const last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
          else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
        }
      };
      window.addEventListener('keydown', esc);
      return () => {
        window.removeEventListener('keydown', esc);
        document.documentElement.style.overflow = '';
        smooth.lenis?.start();
      };
    }
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // wait a tick so the overlay unlocks scrolling first
    setTimeout(() => scrollToTarget(`#${id}`, id === 'home' ? 0 : 0), open ? 60 : 0);
  };

  return (
    <>
      <header
        ref={bar}
        className={`fixed inset-x-0 top-0 z-[100] transition-[background-color,backdrop-filter,padding,border-color] duration-500 ${
          scrolled ? 'border-b border-white/10 bg-ink/80 py-3 backdrop-blur-xl backdrop-saturate-150' : 'border-b border-transparent py-5 md:py-7'
        }`}
        style={{ opacity: ready ? undefined : 0 }}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 md:px-10">
          <Logo />
          <nav aria-label={t.ui.mainNav} className="hidden xl:block">
            <ul className="flex items-center gap-6 2xl:gap-8">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(n.id);
                    }}
                    aria-current={active === n.id ? 'true' : undefined}
                    className={`relative whitespace-nowrap py-2 text-[0.8rem] font-medium tracking-[0.06em] transition-colors hover:text-ivory ${active === n.id ? 'text-ivory' : 'text-ivory/65'}`}
                  >
                    {t.nav[n.key]}
                    <span className={`absolute inset-x-0 -bottom-0.5 h-px origin-center bg-brass transition-transform duration-500 ${active === n.id ? 'scale-x-100' : 'scale-x-0'}`} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-4 md:gap-6">
            <LangSwitch className="hidden md:flex" />
            <div className="hidden md:block">
              <Btn href="#programme" variant="solid" arrow={false} className="!min-h-11 !px-6">
                {t.nav.cta}
              </Btn>
            </div>
            <button
              ref={toggle}
              type="button"
              className="relative z-[120] grid h-11 w-11 place-items-center rounded-full border border-white/20 xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.ui.menuClose : t.ui.menuOpen}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={menu}
        role="dialog"
        aria-modal="true"
        aria-label={t.ui.mainNav}
        hidden={!open}
        className="fixed inset-0 z-[110] flex flex-col justify-between overflow-y-auto bg-ink-2 px-6 pb-8 pt-28 xl:hidden"
      >
        <ul className="space-y-1">
          {NAV.map((n, i) => (
            <li key={n.id} data-m>
              <a
                href={`#${n.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(n.id);
                }}
                className="flex items-baseline gap-4 border-b border-white/10 py-3 font-display text-[clamp(1.9rem,8vw,3rem)] leading-tight text-ivory"
              >
                <span className="text-xs tracking-widest text-brass" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                {t.nav[n.key]}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-6" data-m>
          <Btn href="#programme" variant="solid" onClick={() => setOpen(false)}>
            {t.nav.cta}
          </Btn>
          <LangSwitch className="justify-center text-sm" />
          <p className="text-center text-xs tracking-[0.3em] text-sand/70">{t.hero.dates}</p>
        </div>
      </div>
    </>
  );
}
