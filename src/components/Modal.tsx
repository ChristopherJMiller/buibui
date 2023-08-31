import { Button, Modal } from 'flowbite-react';
import { useMemo, useState } from 'react';
import { useAppDispatch, useModal } from '../lib/hooks';
import { closeModal } from '../lib/modal';

export function HackModal() {
  const dispatch = useAppDispatch();
  const [currentImage, setCurrentImage] = useState(0);
  const { selectedHack, details, collectHack, inCollection } = useModal();

  const onClick = () => {
    if (selectedHack && details) {
      collectHack(dispatch, selectedHack, details);
    }
  };

  const close = () => dispatch(closeModal());

  const buttonMessage = useMemo(
    () => (inCollection ? 'In Collection' : 'Add to Collection'),
    [inCollection]
  );

  const loadingElement = useMemo(
    () =>
      details === undefined ? (
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
            <p>{details?.description}</p>
            <div className="grid grid-cols-6 gap-2 my-3 text-xs text-bold">
              {details?.tags.map((tag) => (
                <div
                  key={tag}
                  className="p-1 px-2 bg-rose-800 rounded-xl text-center self-center justify-center flex"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <Button
            gradientDuoTone="purpleToBlue"
            outline
            disabled={inCollection}
            onClick={onClick}
          >
            {buttonMessage}
          </Button>
        </div>
      ),
    [details, inCollection]
  );

  const currentImageUrl = useMemo(
    () => details?.screenshot_urls[currentImage] ?? selectedHack?.screenshotUrl,
    [details, selectedHack, currentImage]
  );

  const imageTicker = useMemo(() => {
    if (details) {
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
          disabled={currentImage === details.screenshot_urls.length - 1}
          onClick={() =>
            setCurrentImage(
              Math.min(details.screenshot_urls.length, currentImage + 1)
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
            {currentImage + 1} of {details?.screenshot_urls.length}
          </div>
          {rightArrow}
        </div>
      );
    } else {
      return (
        <div className="h-8 rounded-xl animate-pulse w-24 bg-stone-600"></div>
      );
    }
  }, [currentImage, details]);

  return (
    <Modal
      dismissible
      show={selectedHack !== undefined}
      onClose={close}
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
