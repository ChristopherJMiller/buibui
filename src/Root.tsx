import { Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Alert, Button } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import { open } from '@tauri-apps/api/dialog';

export function Root() {
  const [romPresent, setRomPresent] = useState<boolean | undefined>(undefined);

  const supplyROMLocation = async () => {
    const rom = await open({
      filters: [
        {
          name: 'SNES ROM File',
          extensions: ['smc'],
        },
      ],
    });

    if (rom !== null && !Array.isArray(rom)) {
      try {
        await invoke('prepare_rom', { romLocation: rom });
        setRomPresent(await invoke('rom_present', {}));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setRomPresent(await invoke('rom_present', {}));
      } catch (e) {
        console.warn(e);
      }
    };

    if (romPresent === undefined) {
      run();
    }
  }, [romPresent, setRomPresent]);

  const presentBanner = useMemo(
    () =>
      romPresent || romPresent === undefined ? null : (
        <div className="justify-center flex flex-row my-2">
          <Alert color="failure" icon={HiInformationCircle}>
            <span className="flex flex-inline items-center gap-2">
              <span className="font-medium">
                ROM needs to be imported to prepare hacks
              </span>
              <Button size="xs" onClick={() => supplyROMLocation()}>
                Import Clean Super Mario World ROM
              </Button>
            </span>
          </Alert>
        </div>
      ),
    [romPresent]
  );

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      {presentBanner}
      <Outlet />
    </div>
  );
}
