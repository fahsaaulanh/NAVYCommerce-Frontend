import AccountPageState from "@/features/account/components/AccountPageState";
export default function OrderNotFound() {
  return <AccountPageState title="Pesanan tidak ditemukan" message="Periksa tautan dan akun yang sedang kamu gunakan." status={404} />;
}
