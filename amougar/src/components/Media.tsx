import { memo } from 'react';
import { MEDIA, type MediaId, type MediaDef } from '../data/media';
import { Scene } from './Scene';

/** Renders a real photo when one is configured in data/media.ts, otherwise the procedural scene. */
export const Media = memo(function Media({ id, alt, className = '', eager = false }: { id: MediaId; alt?: string; className?: string; eager?: boolean }) {
  const def: MediaDef = MEDIA[id];
  if (def.src) {
    return (
      <img
        src={def.src}
        srcSet={def.srcSet}
        sizes={def.sizes ?? '100vw'}
        alt={alt ?? ''}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`${className} object-cover`}
        style={{ objectPosition: def.focus }}
      />
    );
  }
  return <Scene spec={def.scene} label={alt} className={className} />;
});
