import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import DappPage from "./pages/Dapp";

const routes = [
  { path: "/", Page: Home },
  { path: "/dapp", Page: DappPage },
];

function Routing() {
  const getRoutes = () =>
    routes.map(({ path, Page }) => (
      <Route key={path} path={path} element={<Page />} />
    ));

  return <Routes>{getRoutes()}</Routes>;
}

export default Routing;
