import { useMemo, useState, type FormEvent } from "react";

import type { TrackerActions } from "@/components/Tracker/useTracker";
import { MESSAGES } from "@/lib/constants/messages";
import { countryOptions } from "@/lib/countries";
import { schengenMembersOn } from "@/lib/rules/schengen";
import type { LocalStay } from "@/lib/storage/localTrips";

interface UseTripFormInput {
  stay: LocalStay | null;
  today: string;
  actions: TrackerActions;
  onDone: () => void;
}

export function useTripForm({ stay, today, actions, onDone }: UseTripFormInput) {
  const [country, setCountry] = useState<string | null>(stay?.country ?? null);
  const [entryDate, setEntryDate] = useState(stay?.entry_date ?? today);
  const [exitDate, setExitDate] = useState(stay?.exit_date ?? "");
  const [stillThere, setStillThere] = useState(stay ? stay.exit_date === null : false);
  const [exitError, setExitError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const countries = useMemo(() => countryOptions(schengenMembersOn(today)), [today]);

  const checkExit = () => {
    setExitError(!stillThere && exitDate && exitDate < entryDate ? MESSAGES.exitBeforeEntry : null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!country) return setFormError(MESSAGES.chooseCountry);
    if (!stillThere && !exitDate) return setFormError(MESSAGES.exitOrStillThere);
    if (!stillThere && exitDate < entryDate) return setExitError(MESSAGES.exitBeforeEntry);
    const result = actions.saveStay(
      { country, entry_date: entryDate, exit_date: stillThere ? "" : exitDate },
      stay?.id,
    );
    if (!result.ok) return setFormError(result.error);
    onDone();
  };

  const remove = () => {
    if (!stay) return;
    const result = actions.removeStay(stay.id);
    if (!result.ok) return setFormError(result.error);
    onDone();
  };

  return {
    countries,
    country,
    setCountry,
    entryDate,
    setEntryDate,
    exitDate,
    setExitDate,
    stillThere,
    setStillThere,
    exitError,
    formError,
    checkExit,
    submit,
    remove,
  };
}
