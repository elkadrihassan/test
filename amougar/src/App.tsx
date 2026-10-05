import { lazy, Suspense, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { LangProvider, useLang } from './i18n/LangContext';
import { gsap, ScrollTrigger, prefersReducedMotion, smooth } from './lib/motion';
import { ReadyContext } from './lib/ready';
import { Loader } from './components/Loader';
import { Cursor } from './components/Cursor';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Intro } from './components/Intro';
import { Stats } from './components/Stats';
import { Heritage } from './components/Heritage';
import { Programme } from './components/Programme';
import { Experiences } from './components/Experiences';
import { City } from './components/City';
import { DigitalHeritage } from './components/DigitalHeritage';
import { Gallery } from './components/Gallery';
import { VideoSection } from './components/Video';
import { News } from './components/News';
import { PracticalInfo } from './components/PracticalInfo';
import { Footer } from './components/Footer';
import { LazyOnView } from './components/LazyOnView';

// Leaflet + map UI only download when the visitor nears the map.
const MapSection = lazy(() => import('./components/MapSection'));

function Site() {
  const { t } = useLang();
  const [ready, setReady] = useState(false);

  // smooth scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger stays in sync
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1.15, easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)) });
    smooth.lenis = lenis;
    lenis.stop(); // locked until the loader lifts
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      smooth.lenis = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    smooth.lenis?.start();
    ScrollTrigger.refresh();
  }, [ready]);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  return (
    <ReadyContext.Provider value={ready}>
      <a href="#main" className="skip-link">
        {t.ui.skip}
      </a>
      <Loader onDone={() => setReady(true)} />
      <Cursor />
      <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden="true">
        <div className="grain" />
      </div>
      <Navbar />
      <main id="main">
        <Hero />
        <Intro />
        <Stats />
        <Heritage />
        <Programme />
        <Experiences />
        <City />
        <DigitalHeritage />
        <Gallery />
        <VideoSection />
        <News />
        <LazyOnView id="carte" minHeight="1100px">
          <Suspense fallback={<div className="min-h-[1100px] bg-ink" />}>
            <MapSection />
          </Suspense>
        </LazyOnView>
        <PracticalInfo />
      </main>
      <Footer />
    </ReadyContext.Provider>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Site />
    </LangProvider>
  );
}
