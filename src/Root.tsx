import { Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';

export function Root() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <Outlet />
    </div>
  );
}
