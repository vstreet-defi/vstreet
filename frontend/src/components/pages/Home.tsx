import { Hero } from "../organisms/Hero/Hero";
import { Partners } from "../organisms/Partners/Partners";
import { Features } from "../organisms/Features/Features";
import { Shilling } from "../organisms/Shilling/Shilling";
import SocialMedia from "components/organisms/SocialMedia";
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
      <Hero isMobile={isMobileDevice()} />
      <Partners />
      <Features />
      <Shilling />
      <SocialMedia />
      <Footer />
    </>
  );
}

export default Home;
