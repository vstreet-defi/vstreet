import React from "react";
import styles from "./Dapp.module.scss";

interface DappTemplateProps {
  bannerComponent?: React.ReactNode;
  sidebarLeft?: React.ReactNode;
  mainContent: React.ReactNode;
  sidebarRight?: React.ReactNode;
}

/**
 * DappTemplate Component
 * Provides the structural layout for the dApp pages.
 * Supports conditional rendering of sidebars and banners, automatically
 * adjusting the layout (e.g., centering content) when sidebars are absent.
 */
function DappTemplate({
  bannerComponent,
  sidebarLeft,
  mainContent,
  sidebarRight,
}: DappTemplateProps) {

  // Determine layout classes based on provided sidebars
  const isCentered = !sidebarLeft && sidebarRight;
  const noSidebars = !sidebarLeft && !sidebarRight;

  const containerClasses = [
    styles.dappContainer,
    isCentered ? styles.centered : "",
    noSidebars ? styles.noSidebars : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {bannerComponent && <div className={styles.banner}>{bannerComponent}</div>}

      {sidebarLeft && (
        <div className={styles.sidebarLeft}>
          {sidebarLeft}
        </div>
      )}

      <div className={styles.mainContent}>
        {mainContent}
      </div>

      {sidebarRight && (
        <div className={styles.sidebarRight}>
          {sidebarRight}
        </div>
      )}
    </div>
  );
}

export default DappTemplate;
