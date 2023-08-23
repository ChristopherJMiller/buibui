import { Hack } from '../lib/hack';
import { useMemo } from 'react';

interface HackGalleryProps {
  hack: Hack;
  onClick: () => void;
}

export function HackGalleryItem({ hack, onClick }: HackGalleryProps) {
  const authors = useMemo(() => hack.authors.join(', '), [hack]);

  return (
    <div
      className="select-none hover:cursor-pointer hover:bg-stone-900 p-1 px-2 rounded-xl h-full flex flex-col items-center gap-2 text-sm my-2"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <img className="object-contain h-auto" src={hack.screenshotUrl} />
      <p className="text-center">{hack.name}</p>
      <p>By {authors}</p>
    </div>
  );
}
