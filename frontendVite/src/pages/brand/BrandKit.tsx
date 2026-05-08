import React from 'react';
import { BoxTranslucidGradient } from '@/vstreet/components/atoms/Box-Translucid-Gradient/Box-Translucid-Gradient';
import { motion } from 'framer-motion';
import styles from './BrandKit.module.scss';
import LogoIcon from '../../vstreet/assets/images/icons/vStreet-icon.svg';
import LogoWhite from '../../vstreet/assets/images/icons/vStreet-Full-Logo-White.png';
import LogoColor from '../../vstreet/assets/images/icons/vStreet-Full-Logo-Color.png';

export function BrandKit() {
  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const brandColors = [
    { name: 'vStreet Cyan', hex: '#00ffc4', description: 'Primary brand color' },
    { name: 'vStreet Green', hex: '#4fff4b', description: 'Secondary accent color' },
    { name: 'Deep Space', hex: '#121215', description: 'Main background' },
    { name: 'Cyber Grey', hex: '#1b1b1f', description: 'Header & Component background' },
  ];

  const bios = {
    short: "vStreet is the ultimate DeFi Hub on Vara Network, empowering users with advanced liquidity provision, lending and borrowing protocols, $VST vaults, and AI-driven agents.",
    long: "vStreet is a next-generation DeFi Hub built on the Vara Network. It provides a comprehensive ecosystem for supplying collateral, borrowing synthetic assets, and participating in sophisticated yield-generating vaults. By integrating AI agents and cutting-edge financial tools, vStreet leverages Vara's speed and security to offer a high-performance experience with a futuristic, street-inspired aesthetic."
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className={styles.container}>

      <motion.main
        className={styles.main}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.section className={styles.hero} variants={itemVariants}>
          <h1 className={styles.title}>Brand Kit</h1>
          <p className={styles.subtitle}>Identity & Assets</p>
        </motion.section>

        <motion.section className={styles.section} variants={itemVariants}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Project Bio</h2>
            <div className={styles.divider} />
          </div>
          <BoxTranslucidGradient className={styles.bioBox}>
            <div className={styles.bioContent}>
              <div className={styles.bioSection}>
                <h3>Short Description</h3>
                <p>{bios.short}</p>
                <button onClick={() => copyToClipboard(bios.short)} className={styles.copyBtn}>Copy Short Bio</button>
              </div>

              <div className={styles.internalDivider} />

              <div className={styles.bioSection}>
                <h3>Full Bio</h3>
                <p>{bios.long}</p>
                <button onClick={() => copyToClipboard(bios.long)} className={styles.copyBtn}>Copy Full Bio</button>
              </div>
            </div>
          </BoxTranslucidGradient>
        </motion.section>

        <motion.section className={styles.section} variants={itemVariants}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Color Palette</h2>
            <div className={styles.divider} />
          </div>
          <div className={styles.colorGrid}>
            {brandColors.map((color) => (
              <BoxTranslucidGradient key={color.hex} className={styles.colorCard}>
                <div className={styles.colorPreview} style={{ backgroundColor: color.hex }} />
                <div className={styles.colorInfo}>
                  <span className={styles.colorName}>{color.name}</span>
                  <span className={styles.colorHex}>{color.hex}</span>
                  <button onClick={() => copyToClipboard(color.hex)} className={styles.copyHexBtn}>Copy HEX</button>
                </div>
              </BoxTranslucidGradient>
            ))}
          </div>
        </motion.section>

        <motion.section className={styles.section} variants={itemVariants}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Typography</h2>
            <div className={styles.divider} />
          </div>
          <div className={styles.fontGrid}>
            <BoxTranslucidGradient className={styles.fontCard}>
              <h3 style={{ fontFamily: 'Montserrat' }}>Montserrat</h3>
              <p>Used for Titles and Headlines. Bold, futuristic, and impactful.</p>
              <a href="https://fonts.google.com/specimen/Montserrat" target="_blank" rel="noreferrer" className={styles.downloadLink}>Google Fonts Link</a>
            </BoxTranslucidGradient>
            <BoxTranslucidGradient className={styles.fontCard}>
              <h3 style={{ fontFamily: 'Inter' }}>Inter</h3>
              <p>Primary body font. Clean, modern, and highly readable.</p>
              <a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noreferrer" className={styles.downloadLink}>Google Fonts Link</a>
            </BoxTranslucidGradient>
            <BoxTranslucidGradient className={styles.fontCard}>
              <h3 style={{ fontFamily: 'Roboto Mono' }}>Roboto Mono</h3>
              <p>Used for technical data and numbers. Precision and clarity.</p>
              <a href="https://fonts.google.com/specimen/Roboto+Mono" target="_blank" rel="noreferrer" className={styles.downloadLink}>Google Fonts Link</a>
            </BoxTranslucidGradient>
          </div>
        </motion.section>

        <motion.section className={styles.section} variants={itemVariants}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Logo Assets</h2>
            <div className={styles.divider} />
          </div>
          <div className={styles.logoGrid}>
            <BoxTranslucidGradient className={styles.logoCard}>
              <div className={styles.logoImgWrapper}>
                <img src={LogoIcon} alt="vStreet Icon" className={styles.logoImg} />
              </div>
              <span>Isotype (SVG)</span>
              <a href={LogoIcon} download="vStreet-Isotype.svg" className={styles.downloadBtn}>Download SVG</a>
            </BoxTranslucidGradient>
            <BoxTranslucidGradient className={styles.logoCard}>
              <div className={styles.logoImgWrapper}>
                <img src={LogoWhite} alt="vStreet Logo White" className={styles.logoImg} />
              </div>
              <span>Full Logo (White)</span>
              <a href={LogoWhite} download="vStreet-Full-Logo-White.png" className={styles.downloadBtn}>Download PNG</a>
            </BoxTranslucidGradient>
            <BoxTranslucidGradient className={styles.logoCard}>
              <div className={styles.logoImgWrapper}>
                <img src={LogoColor} alt="vStreet Logo Color" className={styles.logoImg} />
              </div>
              <span>Full Logo (Color)</span>
              <a href={LogoColor} download="vStreet-Full-Logo-Color.png" className={styles.downloadBtn}>Download PNG</a>
            </BoxTranslucidGradient>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}
