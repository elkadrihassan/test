import { ArrowUpRight } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import type { MediaId } from '../data/media';
import { Media } from './Media';
import { Reveal, SectionHead, Btn } from './ui';

const IMG: MediaId[] = ['news1', 'news2', 'news3'];

export function News() {
  const { t } = useLang();
  const n = t.news;
  return (
    <section id="actualites" className="bg-ivory py-28 text-ink md:py-40">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <SectionHead kicker={n.kicker} title={n.title} tone="light" className="lg:col-span-8" />
          <Reveal className="lg:col-span-4 lg:justify-self-end">
            <Btn href="#actualites" variant="dark">
              {n.all}
            </Btn>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-14 border-t border-ink/20 pt-10 md:mt-24 lg:grid-cols-12">
          {/* lead story */}
          <Reveal as="article" y={50} className="group lg:col-span-7 lg:border-e lg:border-ink/15 lg:pe-10">
            <a href="#actualites" className="block" data-cursor="view" aria-label={`${n.read}: ${n.cards[0].title}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                <div className="tile-media absolute inset-0">
                  <Media id={IMG[0]} alt="" className="h-full w-full" />
                </div>
                <span className="absolute start-5 top-5 bg-ivory px-3 py-1.5 text-[0.64rem] font-semibold tracking-[0.25em] text-ink">{n.cards[0].tag}</span>
              </div>
              <div className="mt-7 flex items-baseline justify-between gap-6 text-xs tracking-[0.2em] text-ink/50">
                <span>N° 01</span>
                <span>{n.cards[0].date}</span>
              </div>
              <h3 className="h-display mt-4 text-[clamp(2rem,4vw,3.8rem)] transition-colors duration-500 group-hover:text-terracotta">{n.cards[0].title}</h3>
              <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-ink/65">{n.cards[0].text}</p>
              <span className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em]">
                {n.read} <ArrowUpRight size={14} className="rtl:-scale-x-100" aria-hidden="true" />
              </span>
            </a>
          </Reveal>

          <div className="flex flex-col gap-12 lg:col-span-5">
            {[1, 2].map((k) => (
              <Reveal as="article" key={k} y={50} delay={k * 0.1} className={`group ${k === 1 ? 'border-b border-ink/15 pb-12' : ''}`}>
                <a href="#actualites" className="grid grid-cols-5 gap-6" data-cursor="view" aria-label={`${n.read}: ${n.cards[k].title}`}>
                  <div className="relative col-span-2 aspect-[3/4] overflow-hidden bg-ink">
                    <div className="tile-media absolute inset-0">
                      <Media id={IMG[k]} alt="" className="h-full w-full" />
                    </div>
                  </div>
                  <div className="col-span-3 flex flex-col">
                    <span className="text-[0.64rem] font-semibold tracking-[0.25em] text-terracotta">{n.cards[k].tag}</span>
                    <h3 className="h-display mt-3 text-[clamp(1.5rem,2.3vw,2.2rem)] transition-colors duration-500 group-hover:text-terracotta">{n.cards[k].title}</h3>
                    <p className="mt-3 hidden text-sm leading-relaxed text-ink/60 sm:block">{n.cards[k].text}</p>
                    <div className="mt-auto flex items-center justify-between pt-5 text-xs tracking-[0.2em] text-ink/50">
                      <span>N° 0{k + 1}</span>
                      <span>{n.cards[k].date}</span>
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
