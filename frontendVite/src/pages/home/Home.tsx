import { ChakraProvider } from '@chakra-ui/react';
import { Hero } from '@/components/organisms/Hero/Hero';
import { Features } from '@/components/organisms/Features/Features';
import { Shilling } from '@/components/organisms/Shilling/Shilling';
import SocialMedia from '@/components/organisms/SocialMedia';
import { Team } from '@/components/organisms/Team/Team';
import { HomeFooter } from '@/components/templates/HomeFooter/HomeFooter';
import { HomeHeader, HomeTab } from '@/components/templates/HomeHeader/HomeHeader';
import { isMobileDevice } from '@/utils/isMobile';
import SecuredByVara from '@/components/atoms/SecuredByVara/SecuredByVara';

function Home() {
  const navBarItems = [HomeTab.GitHub, HomeTab.Team, HomeTab.ContactUs];
  return (
    <ChakraProvider>
      <HomeHeader items={navBarItems} isMobile={isMobileDevice()} />
      <SecuredByVara />
      <Hero isMobile={isMobileDevice()} />
      <Features isMobile={isMobileDevice()} />
      <Shilling />
      <Team />
      <SocialMedia />
      <HomeFooter />
    </ChakraProvider>
  );
}

export { Home };
