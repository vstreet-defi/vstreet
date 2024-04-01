import Routing from "components";
import { withProviders } from "hocs";
import "App.scss";

function Component() {
  return (
    <>
      <main>
        <Routing />
      </main>
    </>
  );
}

export const App = withProviders(Component);
