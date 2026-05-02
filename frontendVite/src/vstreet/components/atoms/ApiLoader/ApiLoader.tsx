import styles from './ApiLoader.module.scss';

function ApiLoader() {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinnerWrapper}>
        <div className={styles.spinner} />
        <div className={styles.spinnerInner} />
      </div>
    </div>
  );
}

export default ApiLoader;
