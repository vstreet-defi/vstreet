import Routing from "components";
import { withProviders } from "hocs";
import Background from "components/atoms/Background/Background";
import "App.scss";

function Component() {
  return (
    <>
      <Background />
      <main>
        <Routing />
      </main>
    </>
  );
}

export const App = withProviders(Component);
