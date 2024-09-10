import { Hero } from "../organisms/Hero/Hero";
import { Features } from "../organisms/Features/Features";
import { Shilling } from "../organisms/Shilling/Shilling";
import SocialMedia from "components/organisms/SocialMedia";
import { Team } from "../organisms/Team/Team";
import { Footer } from "../templates/Footer/Footer";
import Header from "../templates/Header/Header";
import { isMobileDevice } from "utils/isMobile";
import { HomeTab } from "../templates/Header/Header";
import SecuredByVara from "components/atoms/SecuredByVara/SecuredByVara";

function Home() {
  const navBarItems = [HomeTab.GitHub, HomeTab.Team, HomeTab.ContactUs];
  return (
    <>
      <Header
        isAccountVisible={false}
        items={navBarItems}
        isMobile={isMobileDevice()}
      />
      <SecuredByVara />
      <Hero isMobile={isMobileDevice()} />
      <Features isMobile={isMobileDevice()} />
      <Shilling />
      <Team />
      <SocialMedia />
      <Footer />
    </>
  );
}

export default Home;
