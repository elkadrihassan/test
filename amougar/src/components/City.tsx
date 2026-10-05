import { useLang } from '../i18n/LangContext';
import type { MediaId } from '../data/media';
import { Media } from './Media';
import { Btn, Reveal, SectionHead } from './ui';

const CARDS: { media: MediaId; span: string }[] = [
  { media: 'cityTan', span: 'md:col-span-5 md:row-span-2' },
  { media: 'cityPlage', span: 'md:col-span-4' },
  { media: 'cityPort', span: 'md:col-span-3' },
  { media: 'citySahara', span: 'md:col-span-3' },
  { media: 'cityMarkets', span: 'md:col-span-4' },
  { media: 'cityHeritage', span: 'md:col-span-12' },
];

export function City() {
  const { t } = useLang();
  const c = t.city;
  return (
    <section id="tan-tan" className="bg-ivory py-28 text-ink md:py-40">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <SectionHead kicker={c.kicker} title={c.title} intro={c.intro} tone="light" className="lg:col-span-8" />
          <Reveal className="lg:col-span-4 lg:justify-self-end">
            <Btn href="#carte" variant="dark">
              {c.cta}
            </Btn>
          </Reveal>
        </div>

        <ul className="mt-16 grid auto-rows-[250px] grid-cols-1 gap-3 md:mt-24 md:auto-rows-[270px] md:grid-cols-12 md:gap-4">
          {c.cards.map((card, i) => (
            <Reveal as="li" key={i} y={50} delay={(i % 3) * 0.08} className={`group relative overflow-hidden bg-ink ${CARDS[i].span}`}>
              <div className="tile-media absolute inset-0">
                <Media id={CARDS[i].media} alt={card.title} className="h-full w-full" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-ivory md:p-7">
                <div>
                  <h3 className="h-display text-[clamp(1.7rem,2.6vw,2.6rem)]">{card.title}</h3>
                  <p className="mt-1 max-w-xs text-sm text-ivory/75">{card.text}</p>
                </div>
                <span className="font-display text-sm tracking-[0.3em] text-sand/80" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
