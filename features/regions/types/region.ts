export type RegionOption = { code: string; name: string; postalCode: string | null };
export type RegionListResponse = { data: RegionOption[] };
export type RegionLevel = "provinces" | "cities" | "districts" | "villages";
export type RegionSelection = { provinceCode: string; cityCode: string; districtCode: string; villageCode: string };
export const regionPatterns = {
  province: /^[0-9]{2}$/, city: /^[0-9]{2}\.[0-9]{2}$/,
  district: /^[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/, village: /^[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/,
};
export const regionParents = {
  cities: { parameter: "provinceCode", pattern: regionPatterns.province },
  districts: { parameter: "cityCode", pattern: regionPatterns.city },
  villages: { parameter: "districtCode", pattern: regionPatterns.district },
};
export function isRegionLevel(value: string): value is RegionLevel {
  return ["provinces", "cities", "districts", "villages"].includes(value);
}
