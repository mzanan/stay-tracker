import countries from "i18n-iso-countries";

const COUNTRY_CODES = new Set(Object.keys(countries.getAlpha2Codes()));

export function isCountryCode(code: string): boolean {
  return COUNTRY_CODES.has(code);
}
