import styles from "./brand.module.css";
type BrandProps = { inverse?:boolean };
export default function Brand({ inverse=false }:BrandProps) {
  return <span className={styles.brand} role="img" aria-label="NAVYCommerce">
    <svg viewBox="80 162 2048 364" aria-hidden="true" focusable="false" className={styles.logo}>
      <image href="/images/brand/navycommerce-logo.png" width="2172" height="724" />
      {inverse && <svg x="450" y="260" width="610" height="240" viewBox="450 260 610 240" overflow="hidden"><image href="/images/brand/navycommerce-logo.png" width="2172" height="724" style={{filter:"brightness(0) invert(1)"}} /></svg>}
    </svg>
  </span>;
}
