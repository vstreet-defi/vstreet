import { ChakraProvider } from '@chakra-ui/react';
import { Hero } from '@/components/organisms/Hero/Hero';
import { Features } from '@/components/organisms/Features/Features';
import { Shilling } from '@/components/organisms/Shilling/Shilling';
import SocialMedia from '@/components/organisms/SocialMedia';
import { Team } from '@/components/organisms/Team/Team';
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
      <Shilling />
      <Team />
      <SocialMedia />
      <HomeFooter />
    </ChakraProvider>
  );
}

export { Home };
