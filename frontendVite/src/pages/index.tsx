import { Route, Routes } from 'react-router-dom';

import { Dapp } from './dapp';
import { Home } from './home';

const routes = [
  { path: '/', Page: Home },
  { path: '/dapp', Page: Dapp },
  { path: '/vst', Page: Dapp },
];

function Routing() {
  const getRoutes = () => routes.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />);

  return <Routes>{getRoutes()}</Routes>;
}

export { Routing };
