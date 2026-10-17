import type { CustomerAddress } from "../types/address";
import styles from "./addresses.module.css";

type Props = { address: CustomerAddress };
export default function AddressDetails({ address }: Props) {
  return <div>
    <div className={styles.recipient}><strong>{address.recipientName}</strong><span>{address.phoneNumber}</span></div>
    <p className={styles.street}>{address.addressLine}</p>
    <p className={styles.locality}>{[address.village, address.district, address.city, address.province].filter(Boolean).join(", ")} {address.postalCode}</p>
    {address.deliveryNotes && <p className={styles.deliveryNotes}><span>Catatan:</span> {address.deliveryNotes}</p>}
  </div>;
}
