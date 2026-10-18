import Icon from "@/components/ui/Icon";
import { formatCurrency, formatNumber } from "@/lib/format";
import { availableShippingRates, deliveryEstimate, shippingRateKey } from "../utils";
import type { ShippingPackage } from "../types";
import styles from "./shipping.module.css";

type Props = { storeId: string; storeName: string; quote?: ShippingPackage; selected?: string;
  pending: boolean; hasAddress: boolean; blocked: boolean; onSelect: (key: string) => void };
export default function ShippingOptions({ storeId, storeName, quote, selected, pending, hasAddress, blocked, onSelect }: Props) {
  const rates = quote?.status === "READY" ? availableShippingRates(quote.rates) : [];
  const message = blocked ? "Perbaiki barang di keranjang sebelum memilih pengiriman."
    : !hasAddress ? "Pilih alamat untuk melihat layanan pengiriman."
    : pending ? "Sedang memuat pilihan pengiriman…"
    : !quote ? "Klik Hitung ongkir untuk melihat pilihan layanan."
    : quote.status !== "READY" ? quote.message ?? "Pengiriman toko ini belum tersedia."
    : !rates.length ? "Belum ada layanan paket yang ditawarkan demo untuk rute ini."
    : null;
  return <div className={styles.panel} aria-busy={pending}>
    <div className={styles.heading}><Icon name="box" /><strong>Pengiriman</strong>
      {quote && quote.weightGrams > 0 && <span>{formatNumber(quote.weightGrams)} gram</span>}
    </div>
    {message ? <p className={styles.help} role={quote && quote.status !== "READY" ? "status" : undefined}>{message}</p>
      : <fieldset className={styles.options} disabled={pending}>
        <legend className="sr-only">Layanan pengiriman {storeName}</legend>
        {rates.map((rate, index) => {
          const key = shippingRateKey(rate);
          return <label key={key} className={`${styles.option} ${selected === key ? styles.selected : ""}`}>
            <input type="radio" name={`shipping-${storeId}`} value={key} checked={selected === key}
              onChange={() => onSelect(key)} />
            <span className={styles.body}><span className={styles.service}><strong>{rate.courierName} · {rate.service}</strong>
              {index === 0 && <span className={styles.badge}>Termurah</span>}</span>
              <span className={styles.description}>{rate.description || "Layanan pengiriman paket"}</span>
              <span className={styles.estimate}>{deliveryEstimate(rate.estimatedDelivery)}</span>
            </span><strong className={styles.price}>{formatCurrency(rate.cost)}</strong>
          </label>;
        })}
      </fieldset>}
  </div>;
}
