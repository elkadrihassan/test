import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pause, Play, RotateCcw, X } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { gsap, prefersReducedMotion, smooth, useMagnetic } from '../lib/motion';
import type { MediaId } from '../data/media';
import { Media } from './Media';
import { Words } from './ui';

/**
 * Drop the official festival film in /public/video/ and set VITE_VIDEO_SRC (e.g. "/video/amougar.mp4").
 * Until then the player shows an animated reel built from the site's own imagery.
 */
const VIDEO_SRC = import.meta.env.VITE_VIDEO_SRC as string | undefined;
const VIDEO_POSTER = import.meta.env.VITE_VIDEO_POSTER as string | undefined;

const REEL: MediaId[] = ['reel1', 'reel2', 'reel3', 'reel4', 'reel5'];
const SLIDE_MS = 3400;

function Player({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const v = t.video;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ended, setEnded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (VIDEO_SRC || !playing || ended) return;
    const id = window.setTimeout(() => (i >= REEL.length - 1 ? setEnded(true) : setI(i + 1)), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [i, playing, ended]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo('.reel-title', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out' });
  }, [i, ended]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    smooth.lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    closeBtn.current?.focus();
    if (!prefersReducedMotion()) gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = root.current?.querySelectorAll<HTMLElement>('button');
        if (!f?.length) return;
        if (e.shiftKey && document.activeElement === f[0]) (e.preventDefault(), f[f.length - 1].focus());
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) (e.preventDefault(), f[0].focus());
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      document.documentElement.style.overflow = '';
      smooth.lenis?.start();
      prev?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div ref={root} role="dialog" aria-modal="true" aria-label={v.title} className="fixed inset-0 z-[260] flex flex-col items-center justify-center bg-black">
      <button ref={closeBtn} type="button" onClick={onClose} aria-label={t.ui.close} className="absolute end-4 top-4 z-20 grid h-12 w-12 place-items-center rounded-full border border-white/30 text-ivory backdrop-blur hover:bg-white/10 md:end-8 md:top-8">
        <X size={22} aria-hidden="true" />
      </button>
      {VIDEO_SRC ? (
        <video className="max-h-full w-full" src={VIDEO_SRC} poster={VIDEO_POSTER} controls autoPlay playsInline />
      ) : (
        <>
          <div className="relative aspect-[4/5] max-h-[100svh] w-full overflow-hidden md:aspect-[21/9] md:max-w-[min(100vw,calc(100svh*2.333))]">
            {REEL.map((id, n) => (
              <div key={id} className="absolute inset-0 transition-opacity duration-[1200ms]" style={{ opacity: !ended && n === i ? 1 : 0 }} aria-hidden="true">
                <div className="h-full w-full" style={{ animation: n === i && playing && !prefersReducedMotion() ? `kenburns ${SLIDE_MS + 1200}ms ease-out forwards` : undefined }}>
                  <Media id={id} alt="" className="h-full w-full" />
                </div>
              </div>
            ))}
            <div className="grain-local" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            <div className="absolute inset-0 flex items-center justify-center text-center">
              {ended ? (
                <div className="reel-title px-6">
                  <p className="h-display text-[clamp(2.6rem,9vw,7rem)] tracking-[0.12em] text-ivory">{v.reelEnd}</p>
                  <p className="mt-4 text-[0.7rem] tracking-[0.4em] text-sand">{t.hero.place.toUpperCase()}</p>
                </div>
              ) : (
                <p key={i} className="reel-title h-display px-6 text-[clamp(2.4rem,8vw,6.5rem)] italic text-ivory">
                  {v.reel[i]}
                </p>
              )}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 px-5 pb-6 md:px-10 md:pb-8" dir="ltr">
            <button
              type="button"
              onClick={() => (ended ? (setEnded(false), setI(0), setPlaying(true)) : setPlaying((p) => !p))}
              aria-label={ended ? v.play : playing ? t.ui.pause : t.ui.play}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 text-ivory backdrop-blur hover:bg-white/10"
            >
              {ended ? <RotateCcw size={18} aria-hidden="true" /> : playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            </button>
            <div className="flex flex-1 gap-1.5" aria-hidden="true">
              {REEL.map((_, n) => (
                <span key={n} className="relative h-0.5 flex-1 overflow-hidden bg-white/20">
                  <span className="absolute inset-0 origin-left bg-brass" style={{ transform: ended || n < i ? 'scaleX(1)' : 'scaleX(0)', animation: n === i && !ended && playing ? `bar ${SLIDE_MS}ms linear forwards` : undefined, animationPlayState: playing ? 'running' : 'paused' }} />
                </span>
              ))}
            </div>
          </div>
          <p className="absolute inset-x-0 top-6 mx-auto max-w-sm px-16 text-center text-[0.68rem] leading-relaxed text-ivory/50 md:top-8">{v.noVideo}</p>
        </>
      )}
    </div>,
    document.body,
  );
}

export function VideoSection() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const btn = useMagnetic<HTMLButtonElement>(0.35);
  const v = t.video;
  return (
    <section id="film" className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-black text-ivory" aria-label={v.title}>
      <div className="absolute inset-0 -z-20" style={{ animation: prefersReducedMotion() ? undefined : 'kenburns 28s ease-in-out infinite alternate' }}>
        <Media id="video" alt="" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/30 to-black/60" />
      <div className="grain-local -z-[5]" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-[7svh] bg-black" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-[7svh] bg-black" aria-hidden="true" />

      <div className="flex flex-col items-center px-5 text-center">
        <p className="eyebrow text-sand">{v.kicker}</p>
        <Words as="h2" text={v.title} className="h-display mt-6 max-w-5xl text-[clamp(2.8rem,9vw,8.5rem)]" />
        <button ref={btn} type="button" onClick={() => setOpen(true)} aria-label={v.play} data-cursor="link" className="group relative mt-14 grid h-28 w-28 place-items-center rounded-full bg-ivory text-ink transition-transform duration-500 hover:scale-105 md:h-36 md:w-36">
          <span className="absolute inset-0 rounded-full border border-ivory/60 animate-[ring_2.4s_ease-out_infinite]" aria-hidden="true" />
          <span className="absolute inset-0 rounded-full border border-ivory/40 animate-[ring_2.4s_ease-out_1.2s_infinite]" aria-hidden="true" />
          <Play size={34} fill="currentColor" className="ms-1" aria-hidden="true" />
        </button>
        <p className="mt-8 text-xs tracking-[0.3em] text-ivory/60">{v.sub}</p>
      </div>
      {open && <Player onClose={close} />}
    </section>
  );
}
