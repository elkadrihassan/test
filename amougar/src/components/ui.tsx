import { useLayoutEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap, prefersReducedMotion, scrollToTarget, useMagnetic } from '../lib/motion';
import { useReady } from '../lib/ready';

/* ---------------------------------------------------------------- Words */
/** Headline that reveals word by word from a mask. Safe for Arabic (never splits inside a word). */
export function Words({
  text,
  as: Tag = 'span',
  className = '',
  delay = 0,
  waitReady = false,
  start = 'top 88%',
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  waitReady?: boolean;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const ready = useReady();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const inner = el.querySelectorAll<HTMLElement>('.word-mask > span');
    if (waitReady && !ready) {
      gsap.set(inner, { yPercent: 115 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { yPercent: 115, rotate: 3 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.07,
          delay,
          scrollTrigger: waitReady ? undefined : { trigger: el, start, once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [text, ready, waitReady, delay, start]);

  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="word-mask">
            <span>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

/* --------------------------------------------------------------- Reveal */
export function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  y = 40,
  delay = 0,
  stagger = 0,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  y?: number;
  delay?: number;
  stagger?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stagger ? el.children : el,
        { y, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, delay, stagger, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [y, delay, stagger]);
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------- Button */
export function Btn({
  children,
  href,
  onClick,
  variant = 'ghost',
  arrow = true,
  className = '',
  download,
  label,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'solid' | 'ghost' | 'dark';
  arrow?: boolean;
  className?: string;
  download?: boolean;
  label?: string;
}) {
  const ref = useMagnetic<HTMLElement>(0.3);
  const cls = `btn btn-${variant} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <ArrowRight size={16} className="arrow shrink-0" aria-hidden="true" />}
    </>
  );
  if (href) {
    return (
      <a
        ref={ref as never}
        href={href}
        className={cls}
        aria-label={label}
        {...(download ? { download: true } : {})}
        onClick={(e) => {
          if (href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            scrollToTarget(href);
            history.replaceState(null, '', href);
          }
          onClick?.();
        }}
      >
        {inner}
      </a>
    );
  }
  return (
    <button ref={ref as never} type="button" className={cls} onClick={onClick} aria-label={label}>
      {inner}
    </button>
  );
}

/* --------------------------------------------------------------- Heading */
export function SectionHead({
  kicker,
  title,
  intro,
  tone = 'dark',
  className = '',
}: {
  kicker: string;
  title: string;
  intro?: string;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <header className={className}>
      <Reveal y={16}>
        <p className={`eyebrow ${tone === 'light' ? 'text-terracotta' : 'text-brass'}`}>{kicker}</p>
      </Reveal>
      <Words as="h2" text={title} className="h-display mt-6 text-[clamp(2.4rem,6.2vw,5.6rem)]" />
      {intro && (
        <Reveal as="p" y={24} delay={0.1} className={`mt-6 max-w-2xl text-lg leading-relaxed ${tone === 'light' ? 'text-ink/70' : 'text-ivory/65'}`}>
          {intro}
        </Reveal>
      )}
    </header>
  );
}

/* ------------------------------------------------------------- Parallax */
/** Clips its child and drifts it vertically as the block scrolls through the viewport. */
export function Parallax({ children, className = '', amount = 8 }: { children: ReactNode; className?: string; amount?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!outer.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner.current,
        { yPercent: -amount },
        { yPercent: amount, ease: 'none', scrollTrigger: { trigger: outer.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    }, outer);
    return () => ctx.revert();
  }, [amount]);
  const pad = `${amount * 2}%`;
  return (
    <div ref={outer} className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} overflow-hidden ${className}`}>
      <div ref={inner} className="absolute inset-x-0 will-change-transform" style={{ top: `-${amount}%`, bottom: `-${amount}%`, height: `calc(100% + ${pad})` }}>
        {children}
      </div>
    </div>
  );
}
