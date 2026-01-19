import vStreetLogoWhite from "../../../assets/images/icons/vStreet-Logo-White-Big.png";
import { Box, Container, Flex, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import "./Footer.scss";

function Footer() {
  return (
    <Box as="footer" className="footer-main">
      <Container maxW="100vw" p={0}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align="center"
          w="100%"
          px={{ base: 4, md: 10, xl: 24 }}
        >
          <Box className="legal-disclaimer">
            <Heading as="h5" size="xs">LEGAL DISCLAIMER</Heading>
            <Text>
              The information provided on this website does not constitute
              investment advice, financial advice, trading advice, or any other sort
              of advice and you should not treat any of the website's content as
              such. The vStreet team provides the website as a service to the
              public, and is not responsible for, and expressly disclaims all
              liability for, damages of any kind arising out of use, reference to,
              or reliance on any information contained within this website. While
              the information contained within this website is periodically updated,
              no guarantee is given that the information provided in this website is
              correct, complete, and up-to-date. vStreet
            </Text>
          </Box>
          <Stack className="rights" spacing={4}>
            <Image src={vStreetLogoWhite} alt="vStreet" h="48px" w="auto" />
            <Text>© 2026 All rights reserved by vStreet</Text>
            <Link
              href="https://x.com/PsyLabs_io"
              target="_blank"
              rel="noopener noreferrer"
              className="psy-link"
            >
              A product by Psy Labs
            </Link>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
}

export { Footer };
