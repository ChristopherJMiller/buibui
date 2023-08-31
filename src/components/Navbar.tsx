import { Button } from 'flowbite-react';
import { NavigateFunction, useLocation, useNavigate } from 'react-router-dom';

const PATHS = [['Gallery', '/']];

interface NavButtonProps {
  active: boolean;
  name: string;
  path: string;
  navigate: NavigateFunction;
}

function NavButton({ active, name, path, navigate }: NavButtonProps) {
  return (
    <Button
      gradientDuoTone="purpleToBlue"
      outline={!active}
      onClick={() => navigate(path)}
    >
      <p>{name}</p>
    </Button>
  );
}

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const buttons = PATHS.map(([name, path]) => (
    <NavButton
      key={path}
      name={name}
      path={path}
      active={location.pathname === path}
      navigate={navigate}
    />
  ));

  return (
    <div className="justify-center flex flex-row gap-4 my-2">{buttons}</div>
  );
}
