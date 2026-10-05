import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { gsap, prefersReducedMotion, smooth } from '../lib/motion';
import type { MediaId } from '../data/media';
import { Media } from './Media';
import { Reveal, SectionHead } from './ui';

const ITEMS: { id: MediaId; ratio: string }[] = [
  { id: 'g1', ratio: '4/5' },
  { id: 'g2', ratio: '3/4' },
  { id: 'g3', ratio: '1/1' },
  { id: 'g4', ratio: '4/5' },
  { id: 'g5', ratio: '3/4' },
  { id: 'g6', ratio: '16/11' },
  { id: 'g7', ratio: '4/5' },
  { id: 'g8', ratio: '1/1' },
  { id: 'g9', ratio: '4/5' },
  { id: 'g10', ratio: '3/4' },
  { id: 'g11', ratio: '16/11' },
  { id: 'g12', ratio: '1/1' },
];

function Lightbox({ index, onClose, onIndex }: { index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const { t, dir } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const caps = t.gallery.items;
  const n = ITEMS.length;
  const step = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);
  const touch = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    gsap.fromTo('.lb-img', { scale: 0.92, y: 30 }, { scale: 1, y: 0, duration: 0.8, ease: 'expo.out' });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo('.lb-img', { opacity: 0.2, x: 30 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
  }, [index]);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    smooth.lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') step(dir === 'rtl' ? -1 : 1);
      else if (e.key === 'ArrowLeft') step(dir === 'rtl' ? 1 : -1);
      else if (e.key === 'Tab') {
        const f = root.current?.querySelectorAll<HTMLElement>('button');
        if (!f?.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      document.documentElement.style.overflow = '';
      smooth.lenis?.start();
      prevFocus?.focus?.();
    };
  }, [onClose, step, dir]);

  return createPortal(
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={t.gallery.lightbox}
      className="fixed inset-0 z-[260] flex flex-col bg-ink/95 backdrop-blur-md"
      onPointerDown={(e) => (touch.current = e.clientX)}
      onPointerUp={(e) => {
        if (touch.current != null && e.pointerType === 'touch') {
          const dx = e.clientX - touch.current;
          if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
        }
        touch.current = null;
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 text-ivory md:px-10 md:py-6">
        <span className="text-xs tracking-[0.3em] text-sand" dir="ltr">
          {String(index + 1).padStart(2, '0')} / {n}
        </span>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label={t.ui.close} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 hover:bg-white/10">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 md:px-24" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <button type="button" onClick={() => step(-1)} aria-label={t.ui.prev} className="absolute start-3 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-ink/50 text-ivory backdrop-blur hover:bg-white/10 md:start-8">
          <ChevronLeft size={22} aria-hidden="true" className="rtl:rotate-180" />
        </button>
        <div className="lb-img relative h-full max-h-[78svh] w-full max-w-[1200px] overflow-hidden shadow-2xl">
          <Media id={ITEMS[index].id} alt={caps[index]} className="h-full w-full" />
        </div>
        <button type="button" onClick={() => step(1)} aria-label={t.ui.next} className="absolute end-3 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-ink/50 text-ivory backdrop-blur hover:bg-white/10 md:end-8">
          <ChevronRight size={22} aria-hidden="true" className="rtl:rotate-180" />
        </button>
      </div>
      <p className="px-6 py-5 text-center font-display text-xl text-ivory md:py-7 md:text-2xl" aria-live="polite">
        {caps[index]}
      </p>
    </div>,
    document.body,
  );
}

export function Gallery() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <section id="galerie" className="bg-ink-2 py-28 md:py-40">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <SectionHead kicker={t.gallery.kicker} title={t.gallery.title} intro={t.gallery.intro} />
        <ul className="mt-16 columns-2 gap-3 md:mt-24 md:columns-3 md:gap-5 lg:columns-4">
          {ITEMS.map((it, i) => (
            <Reveal as="li" key={it.id} y={50} delay={(i % 4) * 0.06} className="mb-3 break-inside-avoid md:mb-5">
              <button type="button" onClick={() => setOpen(i)} data-cursor="view" aria-label={`${t.ui.view}: ${t.gallery.items[i]}`} className="group relative block w-full overflow-hidden bg-ink" style={{ aspectRatio: it.ratio }}>
                <div className="tile-media absolute inset-0 group-focus-visible:scale-105">
                  <Media id={it.id} alt={t.gallery.items[i]} className="h-full w-full" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <span className="absolute inset-x-0 bottom-0 translate-y-3 p-4 text-start font-display text-lg leading-tight text-ivory opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:text-xl">
                  {t.gallery.items[i]}
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
      {open !== null && <Lightbox index={open} onClose={close} onIndex={setOpen} />}
    </section>
  );
}
