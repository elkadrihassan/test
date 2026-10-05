import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, QrCode, Headphones, Compass, Archive } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { gsap, prefersReducedMotion } from '../lib/motion';
import type { MediaId } from '../data/media';
import { Media } from './Media';
import { Reveal, Words } from './ui';

const MODE_ICONS = [QrCode, Headphones, Compass, Archive];

/* --------------------------------------------------------------- SCAN */
function makeQr(seed = 7) {
  const N = 25;
  let a = seed;
  const rnd = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cells: boolean[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() > 0.52));
  const finder = (ox: number, oy: number) => {
    for (let y = -1; y <= 7; y++)
      for (let x = -1; x <= 7; x++) {
        const X = ox + x;
        const Y = oy + y;
        if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
        const ring = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[Y][X] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (ring || core);
      }
  };
  finder(0, 0);
  finder(N - 7, 0);
  finder(0, N - 7);
  return cells;
}

function ScanDemo() {
  const { t } = useLang();
  const s = t.digital.scan;
  const qr = useMemo(() => makeQr(), []);
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const scan = () => {
    if (phase === 'scanning') return;
    setPhase('scanning');
    timer.current = window.setTimeout(() => setPhase('done'), prefersReducedMotion() ? 200 : 1600);
  };
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-2">
      <div className="absolute inset-0 opacity-40 blur-[2px]">
        <Media id="xpCamp" alt="" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-ink/50" />
      <div className="absolute inset-x-0 top-[17%] flex flex-col items-center px-8">
        <button type="button" onClick={scan} aria-label={t.digital.modes[0].hint} className="relative aspect-square w-full max-w-[210px] rounded-sm bg-ivory p-3 shadow-2xl">
          <svg viewBox="0 0 25 25" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
            {qr.map((row, y) => row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0d0b09" /> : null)))}
          </svg>
          {[['start-0 top-0', 'border-s-2 border-t-2'], ['end-0 top-0', 'border-e-2 border-t-2'], ['start-0 bottom-0', 'border-s-2 border-b-2'], ['end-0 bottom-0', 'border-e-2 border-b-2']].map(([pos, b], i) => (
            <span key={i} className={`absolute -m-2 h-6 w-6 border-terracotta ${pos} ${b}`} aria-hidden="true" />
          ))}
          {phase === 'scanning' && <span className="absolute inset-x-0 h-0.5 bg-terracotta shadow-[0_0_18px_4px_rgba(181,83,47,0.8)] animate-[scanline_1.4s_ease-in-out_infinite]" aria-hidden="true" />}
        </button>
        <p className="mt-6 text-center text-[0.68rem] tracking-[0.2em] text-ivory/70" aria-live="polite">
          {phase === 'scanning' ? s.scanning : t.digital.modes[0].hint}
        </p>
      </div>
      <div className={`absolute inset-x-3 bottom-3 rounded-xl bg-ivory p-5 text-ink shadow-2xl transition-all duration-700 ease-[var(--ease-out-expo)] ${phase === 'done' ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[110%] opacity-0'}`}>
        <p className="eyebrow !text-[0.6rem] text-terracotta">{s.tag}</p>
        <h4 className="font-display mt-3 text-2xl leading-tight">{s.title}</h4>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-ink/70">{s.text}</p>
        <button type="button" onClick={() => setPhase('idle')} className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-burgundy underline underline-offset-4">
          {s.again}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- LISTEN */
// Karplus–Strong plucked string: gives a lute-like tone with no audio files.
function pluck(ctx: AudioContext, freq: number, dur: number) {
  const sr = ctx.sampleRate;
  const n = Math.floor(sr * dur);
  const buf = ctx.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  const N = Math.max(2, Math.round(sr / freq));
  const ring = new Float32Array(N);
  for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const nxt = ring[(idx + 1) % N];
    d[i] = ring[idx];
    ring[idx] = 0.9965 * 0.5 * (ring[idx] + nxt);
    idx = (idx + 1) % N;
  }
  return buf;
}
// D-minor pentatonic phrase (Hz) + step lengths (s)
const PHRASE: [number, number][] = [[293.66, 0.42], [349.23, 0.42], [392, 0.28], [440, 0.28], [392, 0.42], [349.23, 0.42], [293.66, 0.84], [261.63, 0.42], [293.66, 0.42], [349.23, 0.56], [293.66, 1.1]];

function useLute() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timer = useRef<number>(0);
  const cache = useRef<Map<number, AudioBuffer>>(new Map());
  const stop = () => {
    window.clearTimeout(timer.current);
    ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    cache.current.clear();
    setPlaying(false);
  };
  const start = () => {
    const AC = window.AudioContext || (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    const loop = () => {
      if (!ctxRef.current) return;
      let t = ctx.currentTime + 0.05;
      PHRASE.forEach(([f, d]) => {
        let b = cache.current.get(f);
        if (!b) cache.current.set(f, (b = pluck(ctx, f, 2.2)));
        const src = ctx.createBufferSource();
        src.buffer = b;
        src.connect(master);
        src.start(t);
        t += d;
      });
      timer.current = window.setTimeout(loop, (t - ctx.currentTime) * 1000 + 600);
    };
    loop();
    setPlaying(true);
  };
  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps
  return { playing, toggle: () => (playing ? stop() : start()) };
}

function ListenDemo() {
  const { t } = useLang();
  const l = t.digital.listen;
  const { playing, toggle } = useLute();
  const bars = useMemo(() => Array.from({ length: 34 }, (_, i) => 0.3 + Math.abs(Math.sin(i * 0.7)) * 0.7), []);
  return (
    <div className="relative flex h-full w-full flex-col justify-end overflow-hidden bg-ink-2">
      <div className="absolute inset-0 opacity-70">
        <Media id="xpMusic" alt="" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
      <div className="relative px-6 pb-9">
        <div className="flex h-24 items-center justify-center gap-[3px]" aria-hidden="true" dir="ltr">
          {bars.map((h, i) => (
            <span key={i} className="w-[3px] origin-center rounded-full bg-sand" style={{ height: `${h * 100}%`, transform: playing ? undefined : 'scaleY(0.25)', animation: playing && !prefersReducedMotion() ? `eq ${0.7 + (i % 5) * 0.12}s ease-in-out ${(i % 7) * -0.15}s infinite` : undefined, transition: 'transform .4s' }} />
          ))}
        </div>
        <h4 className="font-display mt-6 text-center text-2xl text-ivory">{l.title}</h4>
        <p className="mt-1 text-center text-[0.7rem] tracking-wide text-ivory/55">{l.sub}</p>
        <button type="button" onClick={toggle} aria-pressed={playing} className="mx-auto mt-6 flex items-center gap-3 rounded-full bg-terracotta px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-transform hover:scale-105">
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {playing ? l.stop : l.play}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- DISCOVER */
const TRAD: MediaId[] = ['dTradition1', 'dTradition2', 'dTradition3'];
function DiscoverDemo() {
  const { t, dir } = useLang();
  const d = t.digital.discover.items;
  const scroller = useRef<HTMLUListElement>(null);
  const [n, setN] = useState(0);
  const go = (to: number) => {
    const el = scroller.current;
    if (!el) return;
    const i = Math.max(0, Math.min(d.length - 1, to));
    const li = el.children[i] as HTMLElement;
    el.scrollTo({ left: li.offsetLeft - el.offsetLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    setN(i);
  };
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setN(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };
  return (
    <div className="relative flex h-full w-full flex-col bg-ink-2">
      <ul ref={scroller} onScroll={onScroll} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto" tabIndex={0} aria-label={t.digital.modes[2].hint}>
        {d.map((it, i) => (
          <li key={i} className="relative h-full w-full shrink-0 snap-center">
            <Media id={TRAD[i]} alt="" className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 pb-16">
              <p className="text-[0.6rem] tracking-[0.3em] text-brass" dir="ltr">{String(i + 1).padStart(2, '0')} / 03</p>
              <h4 className="font-display mt-2 text-3xl text-ivory">{it.title}</h4>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-ivory/75">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="absolute inset-x-0 bottom-5 flex items-center justify-between px-6" dir="ltr">
        <button type="button" onClick={() => go(dir === 'rtl' ? n + 1 : n - 1)} aria-label={t.ui.prev} className="grid h-9 w-9 place-items-center rounded-full border border-white/30 text-ivory backdrop-blur hover:bg-white/10">
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span className="flex gap-1.5" aria-hidden="true">
          {d.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all ${i === n ? 'w-6 bg-brass' : 'w-2 bg-white/30'}`} />
          ))}
        </span>
        <button type="button" onClick={() => go(dir === 'rtl' ? n - 1 : n + 1)} aria-label={t.ui.next} className="grid h-9 w-9 place-items-center rounded-full border border-white/30 text-ivory backdrop-blur hover:bg-white/10">
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ ARCHIVE */
function ArchiveDemo() {
  const { t } = useLang();
  const a = t.digital.archive;
  const [v, setV] = useState(50);
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-2">
      <Media id="archive" alt={a.now} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)`, filter: 'grayscale(1) sepia(0.75) contrast(1.15) brightness(0.9)' }} dir="ltr">
        <Media id="archive" alt={a.then} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55))]" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-ivory shadow-[0_0_12px_rgba(255,255,255,0.6)]" style={{ left: `${v}%` }} dir="ltr">
        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ivory bg-ink/60 text-ivory backdrop-blur">
          <ChevronLeft size={12} aria-hidden="true" />
          <ChevronRight size={12} aria-hidden="true" className="-ms-1" />
        </span>
      </div>
      <input type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} aria-label={t.digital.modes[3].hint} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" dir="ltr" />
      <div className="pointer-events-none absolute inset-x-5 top-6 flex justify-between text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-ivory" dir="ltr">
        <span className="rounded-full bg-ink/60 px-3 py-1.5 backdrop-blur">{a.then}</span>
        <span className="rounded-full bg-ink/60 px-3 py-1.5 backdrop-blur">{a.now}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-5 pt-16">
        <h4 className="font-display text-2xl text-ivory">{a.title}</h4>
        <p className="mt-1 text-[0.68rem] leading-relaxed text-ivory/55">{a.note}</p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- main */
export function DigitalHeritage() {
  const { t } = useLang();
  const d = t.digital;
  const [mode, setMode] = useState(0);
  const phone = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    const tw = gsap.fromTo('.phone-screen', { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' });
    return () => void tw.kill();
  }, [mode]);

  const onKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(k)) return;
    e.preventDefault();
    const fwd = k === 'ArrowDown' || (k === (document.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'));
    const nx = (mode + (fwd ? 1 : 3)) % 4;
    setMode(nx);
    tabs.current[nx]?.focus();
  };

  return (
    <section id="digital" className="relative overflow-hidden bg-ink py-28 md:py-44">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ backgroundImage: 'radial-gradient(rgba(184,151,90,0.28) 1px, transparent 1px)', backgroundSize: '34px 34px', maskImage: 'radial-gradient(ellipse at 70% 40%, #000 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 70% 40%, #000 0%, transparent 70%)' }} aria-hidden="true" />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <header className="max-w-5xl">
          <Reveal y={14}>
            <p className="eyebrow text-brass">{d.kicker}</p>
          </Reveal>
          <Words as="h2" text={d.title} className="h-display mt-6 text-[clamp(2.3rem,6vw,5.6rem)]" />
          <Reveal as="p" delay={0.15} className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory/65">
            {d.intro}
          </Reveal>
        </header>

        <div className="mt-16 grid items-center gap-14 lg:mt-24 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-ivory/40">{d.demo}</p>
            <div role="tablist" aria-orientation="vertical" onKeyDown={onKey} className="border-t border-white/10">
              {d.modes.map((m, i) => {
                const Icon = MODE_ICONS[i];
                const sel = mode === i;
                return (
                  <button
                    key={m.key}
                    ref={(el) => void (tabs.current[i] = el)}
                    role="tab"
                    id={`dig-tab-${i}`}
                    aria-selected={sel}
                    aria-controls="dig-panel"
                    tabIndex={sel ? 0 : -1}
                    onClick={() => setMode(i)}
                    className={`group relative flex w-full items-center gap-5 border-b border-white/10 py-5 text-start transition-colors duration-500 md:gap-7 md:py-7 ${sel ? 'text-ivory' : 'text-ivory/45 hover:text-ivory/80'}`}
                  >
                    <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-0.5 bg-terracotta transition-transform duration-500 ${sel ? 'scale-y-100' : 'scale-y-0'}`} />
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors duration-500 md:h-14 md:w-14 ${sel ? 'border-terracotta bg-terracotta text-ivory' : 'border-white/20'}`}>
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.66rem] tracking-[0.4em] text-brass" dir="ltr">{m.key}</span>
                      <span className="mt-1 block font-display text-[clamp(1.6rem,3.2vw,2.6rem)] leading-none">{m.title}</span>
                      <span className={`mt-2 block max-w-sm overflow-hidden text-sm leading-relaxed transition-all duration-500 ${sel ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 md:max-h-24 md:opacity-60'}`}>{m.text}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center lg:col-span-6 lg:justify-end">
            <div ref={phone} className="relative w-[min(300px,78vw)] rounded-[2.6rem] border border-white/20 bg-ink-3 p-2.5 shadow-[0_50px_120px_-30px_rgba(181,83,47,0.45)] md:w-[330px]">
              <div className="absolute inset-x-0 top-5 z-20 mx-auto h-5 w-24 rounded-full bg-ink" aria-hidden="true" />
              <div id="dig-panel" role="tabpanel" aria-labelledby={`dig-tab-${mode}`} className="phone-screen relative aspect-[9/18.5] w-full overflow-hidden rounded-[2.1rem]">
                {mode === 0 && <ScanDemo />}
                {mode === 1 && <ListenDemo />}
                {mode === 2 && <DiscoverDemo />}
                {mode === 3 && <ArchiveDemo />}
              </div>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <Reveal className="mt-24 grid items-center gap-8 border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8 md:mt-32 md:grid-cols-[auto_1fr_auto] md:gap-12 md:p-12">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="31" stroke="#b8975a" strokeOpacity="0.6" />
            <path d="M12 38c6-2 10-6 14-14 2 6 6 9 12 10-3 1-5 3-6 6-2-3-5-4-9-3 2 2 3 4 3 7-4-3-9-5-14-6Z" fill="#d8c3a0" />
            <path d="M30 40c6-2 12-8 22-16-3 8-8 15-16 20-2-2-4-3-6-4Z" fill="#b5532f" />
          </svg>
          <div>
            <p className="font-display text-2xl text-sand md:text-3xl">{d.powered}</p>
            <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ivory/65">{d.poweredText}</p>
          </div>
          <ul className="flex flex-wrap gap-2 md:max-w-[15rem] md:justify-end" aria-hidden="true">
            {['QR', 'AUDIO', 'AR', 'ARCHIVE', 'YOUTH'].map((k) => (
              <li key={k} className="rounded-full border border-white/20 px-3 py-1 text-[0.62rem] tracking-[0.25em] text-ivory/60">{k}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
