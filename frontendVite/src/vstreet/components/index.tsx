import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import DappPage from "./pages/Dapp";
import ApiLoader from "./atoms/ApiLoader";

const routes = [
  { path: "/", Page: Home },
  { path: "/dapp", Page: DappPage },
  { path: "/vst", Page: DappPage },
];

function Routing() {
  const getRoutes = () =>
    routes.map(({ path, Page }) => (
      <Route key={path} path={path} element={<Page />} />
    ));

  return <Routes>{getRoutes()}</Routes>;
}

export { Routing, ApiLoader };
export default Routing;
