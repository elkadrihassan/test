import { useLang } from '../i18n/LangContext';
import { Media } from './Media';
import { Parallax, Reveal, Words } from './ui';

export function Intro() {
  const { t } = useLang();
  const i = t.intro;
  return (
    <section id="moussem" className="relative overflow-hidden bg-ivory py-28 text-ink md:py-44">
      <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-5 md:px-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6 lg:pe-10">
          <Reveal y={14}>
            <p className="eyebrow text-terracotta">{i.label}</p>
          </Reveal>
          <h2 className="h-display mt-8 text-[clamp(2.3rem,4.9vw,4.9rem)]">
            <Words text={i.l1} className="block" />
            <Words text={i.l2} className="block italic text-burgundy" delay={0.15} />
          </h2>
          <div className="mt-10 max-w-xl space-y-5 text-[1.06rem] leading-[1.8] text-ink/75 md:mt-14">
            <Reveal as="p" delay={0.1}>
              {i.p1}
            </Reveal>
            <Reveal as="p" delay={0.2}>
              {i.p2}
            </Reveal>
          </div>
          <Reveal className="mt-10 flex items-center gap-5" delay={0.25}>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-terracotta/50 font-display text-xl text-terracotta" aria-hidden="true">
              08
            </span>
            <span className="text-sm font-medium tracking-wide text-ink/80">{i.fact}</span>
          </Reveal>
        </div>

        <div className="relative lg:col-span-6">
          <Reveal y={60}>
            <figure className="relative">
              <Parallax className="aspect-[4/5] w-full rounded-[2px] shadow-[0_40px_80px_-30px_rgba(13,11,9,0.55)] md:aspect-[5/6]" amount={7}>
                <Media id="intro" alt={i.caption} className="h-full w-full" />
              </Parallax>
              <figcaption className="mt-4 flex items-center justify-between text-xs tracking-[0.16em] text-ink/55">
                <span>{i.caption}</span>
                <span className="eyebrow !gap-3 text-terracotta">{i.label}</span>
              </figcaption>
              <div className="absolute -bottom-10 -start-6 hidden w-40 md:block lg:-start-14 lg:w-56">
                <Parallax className="aspect-square border-[6px] border-ivory shadow-xl" amount={14}>
                  <Media id="g4" alt="" className="h-full w-full" />
                </Parallax>
              </div>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
