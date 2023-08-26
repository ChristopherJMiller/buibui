import { invoke } from '@tauri-apps/api';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Hack } from '../lib/hack';
import { Loading } from '../components/Loading';
import { HackGalleryRow } from '../components/HackGalleryRow';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { HackModal } from '../components/Modal';

const CHUNK_SIZE = 5;

interface ColumnProps {
  style: CSSProperties;
  index: number;
}

export default function Gallery() {
  const [loading, setLoading] = useState(false);
  const [hacks, setHacks] = useState<Hack[]>([]);
  const [selectedHack, setSelectedHack] = useState<Hack | undefined>(undefined);

  useEffect(() => {
    const run = async () => {
      console.log(await invoke('hack_collection'));
    };

    run();
  }, []);

  const fetchData = async (chunkIndex: number) => {
    setLoading(true);
    const newData: Hack[] = await invoke('get_hack_list', {
      page: Math.floor((chunkIndex * 5) / 10),
    });

    const fullList = [...hacks, ...newData];

    setHacks(fullList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(0);
  }, []);

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

  const isItemLoaded = (index: number) => {
    console.log(index);
    return hackChunks[index] !== undefined;
  };

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
      onHackSelected={(hack) => setSelectedHack(hack)}
    />
  );

  return (
    <div className="h-full">
      <HackModal
        selectedHack={selectedHack}
        dismiss={() => setSelectedHack(undefined)}
      />
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={knownHackCount}
            loadMoreItems={fetchData}
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
