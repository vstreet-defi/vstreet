import { useNavigate } from 'react-router-dom';
import { useRef, useState, useCallback, useEffect, CSSProperties } from 'react';
import styles from './Hero.module.scss';
import widgetStyles from './HeroWidget.module.scss';

function useCard3D(max = 6, scale = 1.02) {
  const ref = useRef<HTMLDivElement>(null);
  const baseTransform = 'perspective(1000px) rotateX(4deg) rotateY(-8deg) scale3d(1,1,1)';
  const [style, setStyle] = useState<CSSProperties>({});

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      setStyle({
        transform: `perspective(1000px) rotateX(${((y - cy) / cy) * -max}deg) rotateY(${((x - cx) / cx) * max}deg) scale3d(${scale},${scale},${scale})`,
        transition: 'transform 0.1s ease-out',
      });
    },
    [max, scale]
  );

  const onLeave = useCallback(() => {
    setStyle({
      transform: baseTransform,
      transition: 'transform 0.45s ease-out',
    });
  }, []);

  return { ref, style, onMove, onLeave };
}

function Hero() {
  const navigate = useNavigate();
  const { ref: widgetRef, style: widgetStyle, onMove, onLeave } = useCard3D(4, 1.03);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive) onMove(e);
  };

  const handleLeave = () => {
    if (interactive) onLeave();
  };

  const handleAnimEnd = () => {
    setAnimDone(true);
    setInteractive(true);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.blobs}>
        <div className={`${styles.blob} ${styles.blobCyan}`} />
        <div className={`${styles.blob} ${styles.blobGreen}`} />
        <div className={`${styles.blob} ${styles.blobMix}`} />
      </div>
      <div className={styles.gridOverlay} />
      <div className={styles.content}>
        <span className={styles.badge}>Live Testnet</span>
        <h1 className={styles.title}>vStreet</h1>
        <h2 className={styles.subtitle}>The DeFi Core on Vara Network</h2>
        <div className={styles.buttons}>
          <button className={styles.buttonPrimary} onClick={() => navigate('/dapp')}>
            Launch dApp
          </button>
          <button className={styles.buttonSecondary} disabled>
            Whitepaper
          </button>
        </div>
      </div>
      <div
        ref={widgetRef}
        style={widgetStyle}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onAnimationEnd={handleAnimEnd}
        className={`${widgetStyles.mainContentCard} ${visible ? widgetStyles.visible : ''} ${animDone ? widgetStyles.animDone : ''}`}
      >
        <div className={`${widgetStyles.cornerAccent} ${widgetStyles.topleft}`} />
        <div className={`${widgetStyles.cornerAccent} ${widgetStyles.topright}`} />
        <div className={`${widgetStyles.cornerAccent} ${widgetStyles.bottomleft}`} />
        <div className={`${widgetStyles.cornerAccent} ${widgetStyles.bottomright}`} />

        <div className={widgetStyles.header}>
          <h2 className={widgetStyles.title}>Lend &amp; Borrow</h2>
          <p className={widgetStyles.subtitle}>Supply collateral to unlock borrowing power on Vara Network</p>
          <div className={widgetStyles.divider} />
        </div>

        <div className={widgetStyles.tabs}>
          <button className={`${widgetStyles.tab} ${widgetStyles.active}`}>Collateral</button>
          <button className={widgetStyles.tab}>Loan</button>
        </div>

        <div className={widgetStyles.fundsCard}>
          <div className={widgetStyles.inputSection}>
            <div className={widgetStyles.availableBalance}>
              Available: <span>1,250,000 VARA</span>
            </div>

            <div className={widgetStyles.inputRow}>
              <div className={widgetStyles.inputWrapper}>
                <div className={widgetStyles.inputLabel}>Amount</div>
                <div className={widgetStyles.amountInput}>
                  <input type="text" placeholder="0.00" readOnly className={widgetStyles.input} />
                </div>
              </div>
            </div>

            <div className={widgetStyles.percentageRow}>
              {[0, 25, 50, 75, 100].map((pct) => (
                <button key={pct} className={widgetStyles.percentageBtn} tabIndex={-1}>{pct}%</button>
              ))}
            </div>
          </div>

          <div className={widgetStyles.actionBtn}>Deposit</div>
        </div>
      </div>
    </section>
  );
}

export { Hero };
