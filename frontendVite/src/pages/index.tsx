import { Route, Routes } from 'react-router-dom';

import { Dapp } from './dapp';
import { Home } from './home';
import { BrandKit } from './brand';
import React from 'react';

interface RouteConfig {
  path: string;
  Page: React.ComponentType;
}

const routes: RouteConfig[] = [
  { path: '/', Page: Home },
  { path: '/dapp', Page: Dapp },
  { path: '/vst', Page: Dapp },
  { path: '/brand', Page: BrandKit },
];

function Routing() {
  const getRoutes = () => routes.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />);

  return <Routes>{getRoutes()}</Routes>;
}

export { Routing };
