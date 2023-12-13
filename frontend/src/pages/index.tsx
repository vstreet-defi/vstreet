import { Route, Routes } from "react-router-dom";
import { Home } from "./home";
import { Main } from "./main";
import { Dapp } from "./dapp";
import { Mint } from "./mint";

const routes = [
  { path: "/", Page: Home },
  { path: "/main", Page: Main },
  { path: "/dapp", Page: Dapp },
  { path: "/mint", Page: Mint },
];

function Routing() {
  const getRoutes = () =>
    routes.map(({ path, Page }) => (
      <Route key={path} path={path} element={<Page />} />
    ));

  return <Routes>{getRoutes()}</Routes>;
}

export { Routing };
