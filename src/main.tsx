import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Gallery from './pages/Gallery';
import { Root } from './Root';
import { Provider } from 'react-redux';
import store from './lib';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <Gallery />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
