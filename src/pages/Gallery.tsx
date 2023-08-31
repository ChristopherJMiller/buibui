import { CSSProperties, useMemo } from 'react';
import { Hack } from '../lib/hack';
import { Loading } from '../components/Loading';
import { HackGalleryRow } from '../components/HackGalleryRow';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { HackModal } from '../components/Modal';
import { useAppDispatch, useGallery } from '../lib/hooks';
import { openHack } from '../lib/modal';

const CHUNK_SIZE = 5;

interface ColumnProps {
  style: CSSProperties;
  index: number;
}

export default function Gallery() {
  const dispatch = useAppDispatch();
  const { loading, hacks, fetchData } = useGallery();

  const hackChunks = useMemo(
    () =>
      hacks.reduce<Hack[][]>((resultArray, hack, index) => {
        const chunkIndex = Math.floor(index / CHUNK_SIZE);

        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = [];
        }

        resultArray[chunkIndex].push(hack);

        return resultArray;
      }, []),
    [hacks]
  );

  const isItemLoaded = (index: number) => hackChunks[index] !== undefined;

  const knownHackCount = useMemo(() => hackChunks.length + 10, [hacks]);

  const loadingElement = useMemo(
    () => (loading && hacks.length === 0 ? <Loading /> : null),
    [loading, hacks]
  );

  const Column = ({ index, style }: ColumnProps) => (
    <HackGalleryRow
      key={hackChunks[index][0].id}
      hackRow={hackChunks[index]}
      style={style}
      onHackSelected={(hack) => dispatch(openHack(hack))}
    />
  );

  return (
    <div className="h-full">
      <HackModal />
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={knownHackCount}
            loadMoreItems={(index) => fetchData(index)}
            minimumBatchSize={50}
            threshold={10}
          >
            {({ onItemsRendered, ref }) => (
              <FixedSizeList
                width={width}
                height={height}
                onItemsRendered={onItemsRendered}
                ref={ref}
                itemCount={hackChunks.length}
                itemSize={340}
              >
                {Column}
              </FixedSizeList>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>

      {loadingElement}
    </div>
  );
}
