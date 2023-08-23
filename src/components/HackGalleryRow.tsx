import { CSSProperties, useMemo } from 'react';
import { Hack } from '../lib/hack';
import { HackGalleryItem } from './HackGalleryItem';

interface HackGalleryRowProps {
  hackRow: Hack[];
  onHackSelected: (hack: Hack) => void;
  style: CSSProperties;
}

export function HackGalleryRow({
  hackRow,
  onHackSelected,
  style,
}: HackGalleryRowProps) {
  const hackItems = useMemo(
    () =>
      hackRow.map((hack) => (
        <HackGalleryItem
          key={hack.id}
          hack={hack}
          onClick={() => onHackSelected(hack)}
        />
      )),
    [hackRow]
  );

  return (
    <div className="flex flex-col gap-4 px-3" style={style}>
      <div className="grid grid-cols-5 h-80 gap-4 items-center">
        {hackItems}
      </div>
    </div>
  );
}
