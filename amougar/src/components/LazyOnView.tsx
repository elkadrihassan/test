import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollTrigger } from '../lib/motion';

/** Mounts children (typically a lazy chunk) only when the block nears the viewport, reserving its height meanwhile. */
export function LazyOnView({ children, minHeight, id }: { children: ReactNode; minHeight: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return setShow(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: '900px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // late-mounted content changes page height: re-measure scroll triggers
  useEffect(() => {
    if (!show) return;
    const a = setTimeout(() => ScrollTrigger.refresh(), 400);
    const b = setTimeout(() => ScrollTrigger.refresh(), 1500);
    return () => (clearTimeout(a), clearTimeout(b));
  }, [show]);

  return (
    <div ref={ref} id={id} style={{ minHeight: show ? undefined : minHeight }}>
      {show ? children : null}
    </div>
  );
}
