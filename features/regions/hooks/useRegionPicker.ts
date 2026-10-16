"use client";

import { useState } from "react";
import { useRegionOptions } from "./useRegionOptions";
import type { RegionSelection } from "../types/region";

export function useRegionPicker(initial: RegionSelection) {
  const [value, setValue] = useState(initial);
  const provinces = useRegionOptions("provinces");
  const cities = useRegionOptions("cities", value.provinceCode);
  const districts = useRegionOptions("districts", value.cityCode);
  const villages = useRegionOptions("villages", value.districtCode);
  const provinceValid = provinces.options.some(option => option.code === value.provinceCode);
  const cityValid = provinceValid && cities.options.some(option => option.code === value.cityCode);
  const districtValid = cityValid && districts.options.some(option => option.code === value.districtCode);
  const ready = districtValid && villages.options.some(option => option.code === value.villageCode);
  return { value, setValue, provinces, cities, districts, villages, provinceValid, cityValid, districtValid, ready };
}
