import { Hero } from "../organisms/Hero/Hero";
import { Features } from "../organisms/Features/Features";
import { Partners } from "../organisms/Partners/Partners";
import { Shilling } from "../organisms/Shilling/Shilling";
import { Team } from "../organisms/Team/Team";
import { Footer } from "../templates/Footer/Footer";
import Header from "../templates/Header/Header";
import { isMobileDevice } from "utils/isMobile";

function Home() {
  const navBarItems = ["GitHub", "Team", "Contact us"];
  return (
    <>
      <Header
        isAccountVisible={false}
        items={navBarItems}
        isMobile={isMobileDevice()}
      />
      <Hero />
      <Partners />
      <Features />
      <Shilling />
      <Team />
      <Footer />
    </>
  );
}

export default Home;
