import { countryMap } from '../constants/countryConstants';

export const getCountryCode = countryName => {
  if (!countryName) return null;
  return countryMap[countryName.toLowerCase().replace(/\s/g, '_')] || null;
};
