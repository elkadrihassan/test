import { ArrowUp, Mail } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { scrollToTarget } from '../lib/motion';
import { LangSwitch } from './Navbar';
import { Media } from './Media';
import { Reveal } from './ui';

const SOCIAL = [
  { name: 'Instagram', d: 'M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9ZM12 7.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm0 1.8a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm4.6-2.7a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z' },
  { name: 'Facebook', d: 'M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.400-3.9 4v2.2H8v3h2.4V21h3.100Z' },
  { name: 'YouTube', d: 'M21.6 7.2a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800ZM10 15.100V8.900l5.200 3.100-5.200 3.100Z' },
  { name: 'TikTok', d: 'M16.500 3c.3 2.400 1.800 4 4 4.200v3.100a7 7 0 0 1-4-1.300v6.200a5.700 5.700 0 1 1-5.700-5.700c.3 0 .6 0 .9.100v3.200a2.600 2.600 0 1 0 1.700 2.400V3h3.100Z' },
];

export function Footer() {
  const { t } = useLang();
  const f = t.footer;
  const links = [
    { href: '#moussem', label: f.items.festival },
    { href: '#programme', label: f.items.programme },
    { href: '#patrimoine', label: f.items.heritage },
    { href: '#galerie', label: f.items.gallery },
    { href: '#contact', label: f.items.contact },
  ];
  return (
    <footer id="contact" className="relative overflow-hidden bg-ink pt-24 text-ivory">
      <div className="absolute inset-x-0 top-0 h-56 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true">
        <Media id="footer" alt="" className="h-full w-full" />
      </div>
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="grid gap-14 pt-24 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="font-display text-[2.6rem] leading-none tracking-[0.2em]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>AMOUGAR</p>
            <p className="mt-4 text-sm tracking-[0.25em] text-sand">{f.place}</p>
            <p className="mt-8 max-w-xs font-display text-2xl italic leading-snug text-ivory/80">{f.tagline}</p>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-3">
            <h2 className="eyebrow text-brass">{f.links}</h2>
            <ul className="mt-6 space-y-3">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToTarget(l.href === '#contact' ? document.body.scrollHeight : l.href);
                    }}
                    className="group inline-flex items-center gap-3 text-lg text-ivory/75 transition-colors hover:text-ivory"
                  >
                    <span className="h-px w-0 bg-brass transition-all duration-500 group-hover:w-6" aria-hidden="true" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2} className="md:col-span-4">
            <h2 className="eyebrow text-brass">{f.newsletter}</h2>
            <a href={`mailto:${f.email}`} className="mt-6 inline-flex items-center gap-3 text-lg text-ivory/80 underline decoration-white/20 underline-offset-8 transition-colors hover:text-ivory hover:decoration-brass">
              <Mail size={18} aria-hidden="true" />
              {f.email}
            </a>
            <h2 className="eyebrow mt-10 text-brass">{f.social}</h2>
            <ul className="mt-6 flex gap-3">
              {SOCIAL.map((s) => (
                <li key={s.name}>
                  <a href="#contact" aria-label={s.name} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-ivory/80 transition-all duration-500 hover:-translate-y-1 hover:border-brass hover:bg-brass hover:text-ink">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                      <path d={s.d} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-20 select-none overflow-hidden text-center font-display leading-[0.78] tracking-[0.04em] text-transparent" aria-hidden="true" style={{ fontSize: 'clamp(4rem, 21vw, 21rem)', WebkitTextStroke: '1px rgba(216,195,160,0.28)' }}>
          {t.hero.title}
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 py-8 text-xs text-ivory/50 md:flex-row">
          <p>{f.rights}</p>
          <p className="hidden lg:block">{f.powered}</p>
          <div className="flex items-center gap-6">
            <LangSwitch />
            <button type="button" onClick={() => scrollToTarget(0)} aria-label={t.ui.backTop} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition-colors hover:border-brass hover:text-brass">
              <ArrowUp size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
