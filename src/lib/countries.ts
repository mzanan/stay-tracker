import countries from "i18n-iso-countries";
import english from "i18n-iso-countries/langs/en.json";

countries.registerLocale(english);

const COUNTRY_CODES = new Set(Object.keys(countries.getAlpha2Codes()));
const SHORT_ALIAS_MAX_LENGTH = 3;

export interface CountryOption {
  code: string;
  name: string;
}

function aliasOf(code: string): string | null {
  return countries.getName(code, "en", { select: "alias" }) ?? null;
}

function officialOf(code: string): string {
  return countries.getName(code, "en", { select: "official" }) ?? code;
}

const ALIAS_COUNTS = [...COUNTRY_CODES].reduce((counts, code) => {
  const alias = aliasOf(code);
  if (alias) counts.set(alias, (counts.get(alias) ?? 0) + 1);
  return counts;
}, new Map<string, number>());

function aliasIsClear(alias: string): boolean {
  return (
    ALIAS_COUNTS.get(alias) === 1 &&
    alias.length > SHORT_ALIAS_MAX_LENGTH &&
    !alias.startsWith("The ") &&
    !alias.includes(",")
  );
}

export function isCountryCode(code: string): boolean {
  return COUNTRY_CODES.has(code);
}

export function countryName(code: string): string {
  const alias = aliasOf(code);
  return alias && aliasIsClear(alias) ? alias : officialOf(code);
}

export function countryOptions(codes: Iterable<string> = COUNTRY_CODES): CountryOption[] {
  return [...codes]
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function countryOptionsExcept(excluded: Iterable<string>): CountryOption[] {
  const skip = new Set(excluded);
  return countryOptions().filter((option) => !skip.has(option.code));
}

export function passportsSummary(codes: string[]): { name: string; more: string | null } {
  const [first, ...rest] = codes;
  return { name: first ? countryName(first) : "", more: rest.length > 0 ? `+${rest.length}` : null };
}
