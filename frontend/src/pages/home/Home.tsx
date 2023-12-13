import {} from "@chakra-ui/react";
import { Blocknumber } from "components/gear/blockNumber";

import Gusano from "../../assets/images/3d Swirl Shape.svg";
import LogoWhite from "../../assets/images/vara street logoHOMEWhite.svg";
import { Hero } from "./sections/Hero";
import { Features } from "./sections/Features";
import { Partners } from "./sections/Partners";
import { Shilling } from "./sections/Shilling";
import { Footer } from "./sections/Footer";

function Home() {
  return (
    <>
      <Hero />
      <Partners />
      <Features />
      <Shilling />
      <Footer />
    </>
  );
}

export { Home };
