const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 2,
});
const number = new Intl.NumberFormat("id-ID");
export const formatCurrency = (value: number) => currency.format(value);
export const formatNumber = (value: number) => number.format(value);
