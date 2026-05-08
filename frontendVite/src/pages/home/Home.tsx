import { ChakraProvider } from '@chakra-ui/react';

import { Features } from '@/components/organisms/Features/Features';
import { Hero } from '@/components/organisms/Hero/Hero';
import { Shilling } from '@/components/organisms/Shilling/Shilling';
import { Team } from '@/components/organisms/Team/Team';
import { VSTSection } from '@/components/organisms/VSTSection/VSTSection';
import { HomeFooter } from '@/components/templates/HomeFooter/HomeFooter';
import { HomeHeader, HomeTab } from '@/components/templates/HomeHeader/HomeHeader';
import { isMobileDevice } from '@/utils/isMobile';

function Home() {
  const navBarItems = [HomeTab.GitHub, HomeTab.Team, HomeTab.ContactUs];
  const mobile = isMobileDevice();

  return (
    <ChakraProvider>
      <HomeHeader items={navBarItems} isMobile={mobile} />
      <Hero />
      <Features />
      <VSTSection />
      <Shilling />
      <Team />
      <HomeFooter />
    </ChakraProvider>
  );
}

export { Home };
