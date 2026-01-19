import { Hero } from "../organisms/Hero/Hero";
import { Shilling } from "../organisms/Shilling/Shilling";
import EcosystemHub from "components/organisms/EcosystemHub/EcosystemHub";
import TokenMetrics from "components/organisms/TokenMetrics/TokenMetrics";
import DeflationaryHub from "components/organisms/DeflationaryHub/DeflationaryHub";
import SocialMedia from "components/organisms/SocialMedia";
import { Team } from "../organisms/Team/Team";
import { Footer } from "../templates/Footer/Footer";
import Header from "../templates/Header/Header";
import { isMobileDevice } from "utils/isMobile";
import { HomeTab } from "../templates/Header/Header";

function Home() {
  const navBarItems = [HomeTab.GitHub, HomeTab.Team, HomeTab.ContactUs];
  return (
    <>
      <Header
        isAccountVisible={false}
        items={navBarItems}
        isMobile={isMobileDevice()}
      />
      <Hero isMobile={isMobileDevice()} />
      <EcosystemHub />
      <TokenMetrics />
      <DeflationaryHub />
      <Shilling />
      <Team />
      <SocialMedia />
      <Footer />
    </>
  );
}

export default Home;
