import { BedDouble, Bus, Info, Plane, Siren, Sun, Ticket, type LucideIcon } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { Reveal, SectionHead } from './ui';

const ICONS: LucideIcon[] = [Plane, BedDouble, Sun, Bus, Ticket, Siren, Info];
const SPAN = ['', '', 'sm:col-span-2', '', '', 'sm:col-span-2', 'sm:col-span-2 lg:col-span-4'];

export function PracticalInfo() {
  const { t } = useLang();
  const p = t.practical;
  return (
    <section id="infos" className="bg-sand py-28 text-ink md:py-40">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <SectionHead kicker={p.kicker} title={p.title} tone="light" />
        <ul className="mt-16 grid gap-3 sm:grid-cols-2 md:mt-24 lg:grid-cols-4 lg:gap-4">
          {p.items.map((it, i) => {
            const Icon = ICONS[i];
            const emergency = 'emergency' in it && it.emergency;
            const weather = i === 2;
            return (
              <Reveal
                as="li"
                key={i}
                y={40}
                delay={(i % 4) * 0.07}
                className={`relative flex flex-col justify-between gap-10 p-6 md:p-8 ${SPAN[i]} ${emergency ? 'bg-burgundy text-ivory' : 'bg-ivory'}`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-[1.7rem] leading-none md:text-[2rem]">{it.title}</h3>
                  <Icon size={24} strokeWidth={1.4} className={emergency ? 'text-sand' : 'text-terracotta'} aria-hidden="true" />
                </div>
                {weather ? (
                  <div>
                    <p className="font-display text-6xl leading-none text-terracotta md:text-7xl" dir="ltr">
                      26°<span className="ms-3 text-3xl text-ink/40">/ 15°</span>
                    </p>
                    <ul className="mt-5 space-y-1.5 text-sm text-ink/70">{it.lines.slice(1).map((l) => <li key={l}>{l}</li>)}</ul>
                  </div>
                ) : emergency ? (
                  <ul className="grid grid-cols-3 gap-3">
                    {it.lines.map((l) => {
                      const [label, num] = l.split(/[:：]\s*/);
                      return (
                        <li key={l}>
                          <span className="block font-display text-4xl leading-none text-sand md:text-5xl" dir="ltr">{num}</span>
                          <span className="mt-2 block text-[0.72rem] leading-snug text-ivory/70">{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <ul className={`space-y-2.5 text-[0.95rem] leading-snug text-ink/75 ${i === 6 ? 'sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0' : ''}`}>
                    {it.lines.map((l) => (
                      <li key={l} className="flex gap-3">
                        <span className="mt-[0.6em] h-px w-3 shrink-0 bg-terracotta" aria-hidden="true" />
                        {l}
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-6 text-xs text-ink/55">{p.note}</p>
      </div>
    </section>
  );
}
