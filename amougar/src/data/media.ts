import type { SceneSpec } from '../components/Scene';

/**
 * Every image on the site is referenced by id here.
 * Today each id renders a procedural scene. To use real photography, add a `src`
 * (and optionally `srcSet`) to any entry — the <Media> component will render an
 * optimised <img loading="lazy"> instead, with no other code changes.
 *
 *   hero: { scene: {...}, src: '/photos/hero.jpg', srcSet: '/photos/hero-800.jpg 800w, /photos/hero-1600.jpg 1600w' }
 */
export interface MediaDef {
  scene: SceneSpec;
  src?: string;
  srcSet?: string;
  sizes?: string;
  /** CSS object-position for real photos */
  focus?: string;
}

export const MEDIA = {
  hero: { scene: { kind: 'caravan', mood: 'dusk', seed: 7 } },
  intro: { scene: { kind: 'caravan', mood: 'gold', seed: 21 } },
  nomadism: { scene: { kind: 'sahara', mood: 'gold', seed: 4 } },
  musicPoetry: { scene: { kind: 'music', mood: 'night', seed: 3 } },
  craft: { scene: { kind: 'market', mood: 'dusk', seed: 2 } },
  fantasia: { scene: { kind: 'fantasia', mood: 'gold', seed: 9 } },
  nomadLife: { scene: { kind: 'nomad', mood: 'gold', seed: 12 } },

  xpCaravan: { scene: { kind: 'caravan', mood: 'dawn', seed: 31 } },
  xpCamp: { scene: { kind: 'camp', mood: 'night', seed: 5 } },
  xpMusic: { scene: { kind: 'music', mood: 'dusk', seed: 8 } },
  xpFantasia: { scene: { kind: 'fantasia', mood: 'dusk', seed: 17 } },
  xpFood: { scene: { kind: 'tea', mood: 'dusk', seed: 6 } },
  xpMarket: { scene: { kind: 'market', mood: 'gold', seed: 14 } },

  cityTan: { scene: { kind: 'city', mood: 'dusk', seed: 3 } },
  cityPlage: { scene: { kind: 'beach', mood: 'dusk', seed: 3 } },
  cityPort: { scene: { kind: 'port', mood: 'dawn', seed: 3 } },
  citySahara: { scene: { kind: 'sahara', mood: 'noon', seed: 15 } },
  cityMarkets: { scene: { kind: 'market', mood: 'dusk', seed: 6 } },
  cityHeritage: { scene: { kind: 'gate', mood: 'gold', seed: 3 } },

  g1: { scene: { kind: 'caravan', mood: 'gold', seed: 41 } },
  g2: { scene: { kind: 'portrait', mood: 'gold', seed: 3 } },
  g3: { scene: { kind: 'sahara', mood: 'dusk', seed: 22 } },
  g4: { scene: { kind: 'fabric', mood: 'dusk', seed: 5 } },
  g5: { scene: { kind: 'music', mood: 'night', seed: 13 } },
  g6: { scene: { kind: 'crowd', mood: 'night', seed: 4 } },
  g7: { scene: { kind: 'camp', mood: 'night', seed: 19 } },
  g8: { scene: { kind: 'fantasia', mood: 'dusk', seed: 23 } },
  g9: { scene: { kind: 'tea', mood: 'gold', seed: 3 } },
  g10: { scene: { kind: 'market', mood: 'gold', seed: 9 } },
  g11: { scene: { kind: 'port', mood: 'gold', seed: 12 } },
  g12: { scene: { kind: 'beach', mood: 'gold', seed: 8 } },

  video: { scene: { kind: 'caravan', mood: 'dusk', seed: 51 } },
  reel1: { scene: { kind: 'sahara', mood: 'dawn', seed: 33 } },
  reel2: { scene: { kind: 'portrait', mood: 'gold', seed: 5 } },
  reel3: { scene: { kind: 'music', mood: 'night', seed: 6 } },
  reel4: { scene: { kind: 'camp', mood: 'night', seed: 7 } },
  reel5: { scene: { kind: 'fantasia', mood: 'dusk', seed: 8 } },

  news1: { scene: { kind: 'fantasia', mood: 'dusk', seed: 61 } },
  news2: { scene: { kind: 'portrait', mood: 'dusk', seed: 62 } },
  news3: { scene: { kind: 'gate', mood: 'dusk', seed: 63 } },

  dTradition1: { scene: { kind: 'nomad', mood: 'dusk', seed: 71 } },
  dTradition2: { scene: { kind: 'fabric', mood: 'gold', seed: 72 } },
  dTradition3: { scene: { kind: 'music', mood: 'night', seed: 73 } },
  archive: { scene: { kind: 'city', mood: 'noon', seed: 81 } },
  footer: { scene: { kind: 'sahara', mood: 'night', seed: 91 } },
} satisfies Record<string, MediaDef>;

export type MediaId = keyof typeof MEDIA;
