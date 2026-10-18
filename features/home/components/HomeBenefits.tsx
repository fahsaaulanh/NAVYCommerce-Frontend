import Icon from "@/components/ui/Icon";
import styles from "./home.module.css";

const benefits = [
  { icon: "store", title: "Beragam toko, satu tempat", description: "Jelajahi pilihan produk lintas toko." },
  { icon: "grid", title: "Pilih varian yang sesuai", description: "Lihat pilihan, harga, dan stok produk." },
  { icon: "box", title: "Periksa pilihan pengiriman", description: "Lihat layanan yang tersedia untuk alamatmu." },
] as const;
export default function HomeBenefits() {
  return <ul className={styles.benefits} aria-label="Kemudahan belanja">
    {benefits.map(item => <li key={item.title}><span><Icon name={item.icon} /></span><div><h2>{item.title}</h2><p>{item.description}</p></div></li>)}
  </ul>;
}
