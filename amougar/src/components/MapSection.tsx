import { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { BedDouble, Bus, Camera, Flag, Landmark, MapPin, Utensils, type LucideIcon } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { CAT_COLOR, CENTER, PLACES, PLACE_CATS, type PlaceCat } from '../data/places';
import { Reveal, SectionHead } from './ui';

const ICON: Record<PlaceCat, LucideIcon> = { venue: Flag, culture: Landmark, hotel: BedDouble, food: Utensils, sight: Camera, transport: Bus };

function pin(cat: PlaceCat) {
  const Icon = ICON[cat];
  const svg = renderToStaticMarkup(<Icon size={15} strokeWidth={2} />);
  return L.divIcon({
    className: '',
    html: `<div class="map-pin" style="background:${CAT_COLOR[cat]}">${svg}</div>`,
    iconSize: [34, 34],
    iconAnchor: [4, 38],
    popupAnchor: [13, -34],
  });
}

export default function MapSection() {
  const { t, lang } = useLang();
  const m = t.map;
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const group = useRef<L.LayerGroup | null>(null);
  const markers = useRef<Map<string, L.Marker>>(new Map());
  const [active, setActive] = useState<Set<PlaceCat>>(() => new Set(PLACE_CATS));
  const [tileFail, setTileFail] = useState(false);

  const visible = useMemo(() => PLACES.filter((p) => active.has(p.cat)), [active]);

  // create the map once
  useEffect(() => {
    if (!el.current) return;
    const mobile = L.Browser.mobile;
    const mp = L.map(el.current, { center: CENTER, zoom: 10, scrollWheelZoom: false, dragging: !mobile, zoomControl: true, attributionControl: true });
    let errors = 0;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    })
      .on('tileerror', () => {
        if (++errors > 3) setTileFail(true);
      })
      .on('tileload', () => setTileFail(false))
      .addTo(mp);
    // wheel zoom only after the map has been clicked, so it never hijacks page scrolling
    mp.on('click', () => mp.scrollWheelZoom.enable());
    mp.on('mouseout', () => mp.scrollWheelZoom.disable());
    group.current = L.layerGroup().addTo(mp);
    map.current = mp;
    const ro = new ResizeObserver(() => mp.invalidateSize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      mp.remove();
      map.current = null;
    };
  }, []);

  // (re)build markers on filter / language change
  useEffect(() => {
    const g = group.current;
    const mp = map.current;
    if (!g || !mp) return;
    g.clearLayers();
    markers.current.clear();
    visible.forEach((p) => {
      const name = m.places[p.id as keyof typeof m.places];
      const mk = L.marker([p.lat, p.lng], { icon: pin(p.cat), title: name, alt: name, riseOnHover: true });
      mk.bindPopup(`<strong style="font-size:15px">${name}</strong><br><span style="color:${CAT_COLOR[p.cat]};font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600">${m.cats[p.cat]}</span>`, { closeButton: false });
      mk.addTo(g);
      markers.current.set(p.id, mk);
    });
  }, [visible, m, lang]);

  // fit the view when the set of visible places changes
  useEffect(() => {
    const mp = map.current;
    if (!mp || !visible.length) return;
    const b = L.latLngBounds(visible.map((p) => [p.lat, p.lng] as [number, number]));
    mp.fitBounds(b.pad(0.25), { maxZoom: 13, animate: true, duration: 0.9 });
  }, [visible]);

  const toggle = (c: PlaceCat) =>
    setActive((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });

  const focusPlace = (id: string) => {
    const mk = markers.current.get(id);
    if (!mk || !map.current) return;
    map.current.flyTo(mk.getLatLng(), 14, { duration: 1.1 });
    map.current.once('moveend', () => mk.openPopup());
    el.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  return (
    <section className="bg-ink py-28 md:py-40" aria-labelledby="map-title">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div id="map-title">
          <SectionHead kicker={m.kicker} title={m.title} intro={m.intro} />
        </div>

        <Reveal className="mt-12 flex flex-wrap gap-2.5" y={20}>
          <div role="group" aria-label={m.filters} className="flex flex-wrap gap-2.5">
            {PLACE_CATS.map((c) => {
              const Icon = ICON[c];
              const on = active.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(c)}
                  className={`flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${on ? 'border-transparent text-ivory' : 'border-white/20 text-ivory/50 hover:border-white/50'}`}
                  style={on ? { background: CAT_COLOR[c] } : undefined}
                >
                  <Icon size={14} aria-hidden="true" />
                  {m.cats[c]}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-[22rem_1fr]">
          <nav aria-label={m.list} className="order-2 max-h-[640px] overflow-y-auto border border-white/10 lg:order-1" data-lenis-prevent>
            <ul>
              {visible.map((p) => {
                const Icon = ICON[p.cat];
                return (
                  <li key={p.id} className="border-b border-white/10 last:border-0">
                    <button type="button" onClick={() => focusPlace(p.id)} className="group flex w-full items-center gap-4 px-4 py-3.5 text-start transition-colors hover:bg-white/5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ivory" style={{ background: CAT_COLOR[p.cat] }}>
                        <Icon size={15} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.95rem] text-ivory">{m.places[p.id as keyof typeof m.places]}</span>
                        <span className="block text-[0.64rem] uppercase tracking-[0.18em] text-ivory/45">{m.cats[p.cat]}</span>
                      </span>
                      <MapPin size={14} className="shrink-0 text-ivory/30 transition-colors group-hover:text-brass" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative order-1 lg:order-2" dir="ltr">
            <div ref={el} className="z-0 h-[440px] w-full border border-white/10 lg:h-[640px]" role="application" aria-label={m.title} />
            {tileFail && <p className="pointer-events-none absolute inset-x-4 bottom-8 z-[500] mx-auto w-fit max-w-full rounded bg-ink/90 px-4 py-2 text-center text-xs text-ivory/70">{m.tileFail}</p>}
          </div>
        </div>
        <p className="mt-5 text-xs text-ivory/40">{m.note}</p>
      </div>
    </section>
  );
}
