import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import DappPage from "./pages/Dapp";
//import { Faucet } from "./pages/Faucet";

const routes = [
  { path: "/", Page: Home },
  { path: "/dapp", Page: DappPage },
  { path: "/vst", Page: DappPage },
  //{ path: "/faucet", Page: Faucet },
];

function Routing() {
  const getRoutes = () =>
    routes.map(({ path, Page }) => (
      <Route key={path} path={path} element={<Page />} />
    ));

  return <Routes>{getRoutes()}</Routes>;
}

export default Routing;
