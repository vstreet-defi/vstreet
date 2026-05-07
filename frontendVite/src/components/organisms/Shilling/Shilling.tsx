<<<<<<< HEAD
import { Box, Image, Stack, Text, Flex, Heading } from '@chakra-ui/react';
import { ButtonGradientBorder } from '@/components/atoms/Button-Gradient-Border/Button-Gradient-Border';
import LogoVaraWhite from '@/assets/images/Powered-by-vara.png';
import shillingBg from '@/assets/images/backgrounds/ShillingBG.jpg';

function Shilling() {
  return (
    <Box display="flex" height="fit-content" minW="100%" bgImage={shillingBg} bgSize={'cover'}>
      <Stack
        pl={{ base: '1rem', md: '3rem', xl: '8rem', '2xl': '15rem' }}
        pr={{ base: '1rem' }}
        align="center"
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}
        direction={{ base: 'column', md: 'row' }}>
        <Stack flex={1} spacing={{ base: 5, md: 10 }}>
          <Image w="30rem" src={LogoVaraWhite} />
          <Stack spacing={{ base: 4, sm: 6 }} direction={{ base: 'column', sm: 'row' }}>
            <Box
              ml={{ base: '0', md: '12rem' }}
              alignSelf="center"
              paddingLeft={'120px'}
              sx={{
                '@media screen and (max-width: 748px)': {
                  paddingLeft: '0px',
                },
              }}>
              <a href="https://vara-network.io/" target="_blank" rel="noopener noreferrer">
                <ButtonGradientBorder text="Go to Vara" />
              </a>
            </Box>
          </Stack>
        </Stack>
        <Flex
          flex={1}
          justify="center"
          align="center"
          position="relative"
          w="full"
          pr={{ sm: '0', md: '8rem' }}
          textAlign={{ base: 'center', md: 'right' }}>
          <Box fontFamily={"'Roboto Mono', monospace"} mt={{ base: '4rem', md: '0' }}>
            <Box color="white" mb="2rem">
              <Heading fontFamily={"'Roboto Mono', monospace"} fontWeight="700px" fontSize="24px" color="#4FFF4B">
                High-Speed Transactions and Scalability
              </Heading>
              <Text fontFamily={"'Roboto Mono', monospace"} fontWeight="400px" fontSize={{ lg: '24px' }} color="#FFF">
                Vara Network enhances DeFi with high transaction throughput and scalability. Its Gear Protocol&apos;s
                Actor model ensures rapid transactions at lower fees, addressing issues like network congestion
                effectively
              </Text>
            </Box>

            <Box color="white" mb="2rem">
              <Heading fontFamily={"'Roboto Mono', monospace"} fontWeight="700px" fontSize="24px" color="#00FFC4">
                Enhanced Security and Decentralization in DeFi
              </Heading>
              <Text fontFamily={"'Roboto Mono', monospace"} fontWeight="400px" fontSize={{ lg: '24px' }} color="#FFF">
                Security and decentralization are key in Vara Network. The Actor model supports secure, independent
                operation of smart contracts, minimizing centralization risks and promoting complex decentralized
                applications
              </Text>
            </Box>

            <Box color="white" mb="2rem">
              <Heading fontFamily={"'Roboto Mono', monospace"} fontWeight="700px" fontSize="24px" color="#4FFF4B">
                Innovative Technology for Optimized Performance
              </Heading>
              <Text fontFamily={"'Roboto Mono', monospace"} fontWeight="400px" fontSize={{ lg: '24px' }} color="#FFF">
                Vara Network&apos;s use of Persistent Memory and the WASM Virtual Machine optimizes performance,
                offering faster computations and efficient memory management, crucial for advanced financial services on
                the blockchain
              </Text>
            </Box>
          </Box>
        </Flex>
      </Stack>
    </Box>
  );
}
=======
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FC, useRef, useEffect } from 'react';

import { SectionGrid } from '@/components/atoms/SectionGrid/SectionGrid';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useTypewriter } from '@/hooks/useTypewriter';

import styles from './Shilling.module.scss';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: 'Actor Model',
    text: 'Asynchronous messaging enables parallel execution and stronger security through isolated contract state.',
    number: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: 'Delayed Messaging',
    text: 'Schedule autonomous on-chain actions without centralized inputs. Build self-sustaining applications.',
    number: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Gasless Transactions',
    text: 'Execute transactions without gas fees or signatures, reducing costs and expanding dApp design possibilities.',
    number: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Persistent Memory',
    text: 'Data always available and secure. Programs access only their own memory space, enhancing reliability.',
    number: '04',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Async Processing',
    text: 'Parallel task execution dramatically boosts performance beyond legacy smart contract platforms.',
    number: '05',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Interoperability',
    text: 'Integrate with other chains in a decentralized way to leverage more DeFi legos for feature-rich dApps.',
    number: '06',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
        <path d="M12 7v8M7 12h3l4 4M14 9l3 3" />
      </svg>
    ),
  },
  {
    title: 'Zero-Knowledge Proofs',
    text: 'Elevate privacy and security for your applications with built-in ZKP support, ensuring user trust.',
    number: '07',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
  },
];

const Shilling: FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const cardsStripRef = useRef<HTMLDivElement>(null);
  const magneticCtaRef = useMagnetic(0.25);
  const { displayed: typedWord } = useTypewriter({
    words: ['DeFi', 'Web3'],
    typeSpeed: 140,
    deleteSpeed: 90,
    pauseDuration: 2200,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 901px)', () => {
      if (!rightRef.current || !cardsStripRef.current) return;

      const ctx = gsap.context(() => {
        if (leftRef.current) {
          gsap.fromTo(
            leftRef.current.children,
            { opacity: 0, y: 30 },
            {
              scrollTrigger: {
                trigger: leftRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power3.out',
            }
          );
        }

        const rightHeight = rightRef.current!.offsetHeight;
        const stripHeight = cardsStripRef.current!.offsetHeight;
        const DWELL = window.innerHeight * 0.5;

        gsap.set(cardsStripRef.current, { y: rightHeight });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: `+=${rightHeight + stripHeight + DWELL}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tl.to(cardsStripRef.current, {
          y: -stripHeight,
          ease: 'none',
          duration: rightHeight + stripHeight,
        });

        tl.to({}, { duration: DWELL });
      }, containerRef);

      return () => ctx.revert();
    });

    mm.add('(max-width: 900px)', () => {
      const ctx = gsap.context(() => {
        if (cardsStripRef.current) {
          gsap.set(cardsStripRef.current, { y: 0, clearProps: 'transform' });
        }

        if (leftRef.current) {
          gsap.fromTo(
            leftRef.current.children,
            { opacity: 0, y: 20 },
            {
              scrollTrigger: {
                trigger: leftRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out',
            }
          );
        }
      }, containerRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.shilling}>
      <SectionGrid variant="shilling" />
      <div className={styles.container}>
        <div ref={leftRef} className={styles.left}>
          <span className={styles.overline}>Infrastructure</span>
          <h2 className={styles.headline}>
            Built on the{' '}
            <span className={styles.headlineAccent}>fastest chain</span>{' '}
            for{' '}
            <span className={styles.typewriter}>
              {typedWord}
              <span className={styles.cursor} />
            </span>
          </h2>
          <a
            ref={magneticCtaRef as React.RefObject<HTMLAnchorElement>}
            href="https://vara-network.io/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
          >
            Explore Vara
          </a>
        </div>

        <div ref={rightRef} className={styles.right}>
          <div ref={cardsStripRef} className={styles.cardsStrip}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrap}>
                    {feature.icon}
                  </div>
                  <span className={styles.cardNumber}>{feature.number}</span>
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardText}>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
>>>>>>> VST-182-FE-MIGRATION-VITE

export { Shilling };
