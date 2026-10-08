import { readFileSync, writeFileSync } from "node:fs";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const [csvPath, dataAsOf, retrievedAt] = process.argv.slice(2);
const isDate = (value) => {
  if (!DATE_PATTERN.test(value ?? "")) return false;
  const ms = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(ms) && new Date(ms).toISOString().startsWith(value);
};
if (!csvPath || !isDate(dataAsOf) || !isDate(retrievedAt)) {
  console.error(
    "Usage: node scripts/importPassportIndex.mjs <passport-index-tidy-iso2.csv> <dataAsOf YYYY-MM-DD> <retrievedAt YYYY-MM-DD>",
  );
  process.exit(1);
}

const SAME_COUNTRY = "-1";
const COUNTRY_CODE = /^[A-Z]{2}$/;
const OUTPUT_URL = new URL("../src/lib/rules/seed/passportIndex.json", import.meta.url);
const EXPECTED_HEADER = "Passport,Destination,Requirement";
const KINDS = {
  "visa free": "visaFree",
  "visa on arrival": "visaOnArrival",
  eta: "eta",
  "e-visa": "eVisa",
  "visa required": "visaRequired",
  "no admission": "noAdmission",
};

const unquote = (field) => field.trim().replace(/^"(.*)"$/, "$1");
const lines = readFileSync(csvPath, "utf8")
  .split(/\r?\n/)
  .filter((line) => line.trim() !== "");
const [header, ...rows] = lines;
if (header.split(",").map(unquote).join(",") !== EXPECTED_HEADER) {
  console.error(`Unexpected header: ${header}`);
  process.exit(1);
}

const data = {};
for (const row of rows) {
  const [passport, destination, requirement] = row.split(",").map(unquote);
  if (requirement === SAME_COUNTRY) continue;
  if (!COUNTRY_CODE.test(passport) || !COUNTRY_CODE.test(destination)) {
    console.error(`Invalid country code in row: ${row}`);
    process.exit(1);
  }
  let value;
  if (/^[1-9]\d*$/.test(requirement)) value = Number(requirement);
  else if (KINDS[requirement]) value = KINDS[requirement];
  else {
    console.error(`Unknown requirement "${requirement}" for ${passport} -> ${destination}`);
    process.exit(1);
  }
  data[passport] ??= {};
  data[passport][destination] = value;
}

const output = {
  source: "https://github.com/imorte/passport-index-data",
  dataAsOf,
  retrievedAt,
  data,
};
writeFileSync(OUTPUT_URL, `${JSON.stringify(output)}\n`);
console.log(`Wrote ${Object.keys(data).length} passports to ${OUTPUT_URL.pathname}`);
