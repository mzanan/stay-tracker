import { useMemo, useState } from "react";

import type { TrackerActions } from "@/components/Tracker/useTracker";
import { MESSAGES } from "@/lib/constants/messages";
import { countryOptionsExcept } from "@/lib/countries";
import type { LocalPassport } from "@/lib/storage/localTrips";

export function usePassportChoice(passports: LocalPassport[], actions: TrackerActions) {
  const [country, setCountry] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changingId, setChangingId] = useState<string | null>(null);

  const options = useMemo(
    () => countryOptionsExcept(passports.map((passport) => passport.country)),
    [passports],
  );

  const add = (onAdded?: () => void) => {
    if (!country) return setError(MESSAGES.choosePassport);
    const result = actions.addPassport(country);
    if (!result.ok) return setError(result.error);
    setCountry(null);
    setError(null);
    onAdded?.();
  };

  const change = () => {
    if (!changingId) return;
    if (!country) return setError(MESSAGES.choosePassport);
    const result = actions.changePassport(changingId, country);
    if (!result.ok) return setError(result.error);
    setCountry(null);
    setError(null);
    setChangingId(null);
  };

  const startChange = (id: string) => {
    setChangingId(id);
    setError(null);
  };

  const remove = (id: string) => {
    const result = actions.removePassport(id);
    setError(result.ok ? null : result.error);
  };

  const choose = (code: string) => {
    setCountry(code);
    setError(null);
  };

  return {
    options,
    country,
    choose,
    error,
    changing: changingId !== null,
    submit: () => (changingId ? change() : add()),
    add,
    startChange,
    remove,
  };
}
