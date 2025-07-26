import { Route, Routes } from 'react-router-dom';
//import { Home } from './home';
import Home from "../components/pages/Home"
import DappPage from "../components/pages/Dapp";


const routes = [{ path: '/', Page: Home },{ path: "/dapp", Page: DappPage },];

function Routing() {
  const getRoutes = () => routes.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />);

  return <Routes>{getRoutes()}</Routes>;
}

export { Routing };
