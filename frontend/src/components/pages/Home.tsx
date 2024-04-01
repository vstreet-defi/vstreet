import { Hero } from "../organisms/Hero/Hero";
import { Features } from "../organisms/Features/Features";
import { Partners } from "../organisms/Partners/Partners";
import { Shilling } from "../organisms/Shilling/Shilling";
import { Footer } from "../templates/Footer/Footer";
import Header from "../templates/Header/Header";

function Home() {
  return (
    <>
      <Header isAccountVisible={false} />
      <Hero />
      <Partners />
      <Features />
      <Shilling />
      <Footer />
    </>
  );
}

export default Home;
