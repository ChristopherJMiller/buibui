import { Button, Modal } from 'flowbite-react';
import { Hack, HackDetails } from '../lib/hack';
import { useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api';

interface HackModalProps {
  selectedHack?: Hack;
  dismiss: () => void;
}

export function HackModal({ selectedHack, dismiss }: HackModalProps) {
  const [hackDetails, setHackDetails] = useState<HackDetails | undefined>(
    undefined
  );

  console.log(hackDetails);

  const [currentImage, setCurrentImage] = useState(0);

  const fetchSelectedHackDetails = async () => {
    if (selectedHack) {
      return (await invoke('get_hack_details', {
        id: selectedHack.id,
      })) as HackDetails;
    }
  };

  useEffect(() => {
    const run = async () => {
      if (selectedHack) {
        setCurrentImage(0);
        setHackDetails(undefined);
        const details = await fetchSelectedHackDetails();
        if (details) {
          setHackDetails(details);
        }
      }
    };

    run();
  }, [selectedHack, setHackDetails]);

  const loadingElement = useMemo(
    () =>
      hackDetails === undefined ? (
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-4">
            <div className="h-10 rounded-lg animate-pulse w-full bg-stone-600"></div>
            <div className="flex flex-row gap-2">
              <div className="h-8 rounded-lg animate-pulse w-20 bg-stone-600"></div>
              <div className="h-8 rounded-lg animate-pulse w-20 bg-stone-600"></div>
            </div>
          </div>
          <div className="h-10 rounded-lg animate-pulse w-full bg-stone-600"></div>
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full">
          <div className="gap-4 flex flex-col">
            <p>{hackDetails?.description}</p>
            <div className="flex flex-row gap-4">
              {hackDetails?.tags.map((tag) => (
                <div className="p-1 px-2 bg-rose-800 rounded-xl">{tag}</div>
              ))}
            </div>
          </div>
          <Button gradientDuoTone="purpleToBlue" outline>
            Add to Collection
          </Button>
        </div>
      ),
    [hackDetails]
  );

  const currentImageUrl = useMemo(
    () =>
      hackDetails?.screenshot_urls[currentImage] ?? selectedHack?.screenshotUrl,
    [hackDetails, selectedHack, currentImage]
  );

  const imageTicker = useMemo(() => {
    if (hackDetails) {
      const leftArrow = (
        <Button
          gradientDuoTone="purpleToBlue"
          size="xs"
          pill
          disabled={currentImage === 0}
          outline
          onClick={() => setCurrentImage(Math.max(0, currentImage - 1))}
        >
          {'<'}
        </Button>
      );

      const rightArrow = (
        <Button
          gradientDuoTone="purpleToBlue"
          size="xs"
          pill
          outline
          disabled={currentImage === hackDetails.screenshot_urls.length - 1}
          onClick={() =>
            setCurrentImage(
              Math.min(hackDetails.screenshot_urls.length, currentImage + 1)
            )
          }
        >
          {'>'}
        </Button>
      );

      return (
        <div className="flex flex-row gap-2 items-center">
          {leftArrow}
          <div>
            {currentImage + 1} of {hackDetails?.screenshot_urls.length}
          </div>
          {rightArrow}
        </div>
      );
    } else {
      return (
        <div className="h-8 rounded-xl animate-pulse w-24 bg-stone-600"></div>
      );
    }
  }, [currentImage, hackDetails]);

  return (
    <Modal
      dismissible
      show={selectedHack !== undefined}
      onClose={dismiss}
      size={'6xl'}
    >
      <Modal.Header className="bg-stone-800 border-stone-800"></Modal.Header>
      <Modal.Body className="bg-stone-800 text-white flex flex-row gap-6">
        <div className="items-center flex flex-col gap-2 basis-1/3 justify-between">
          <img src={currentImageUrl} className="w-full max-w-xs" />
          {imageTicker}
        </div>
        <div className="flex flex-col gap-4 basis-2/3">
          <h1 className="text-2xl">{selectedHack?.name}</h1>
          {loadingElement}
        </div>
      </Modal.Body>
    </Modal>
  );
}
