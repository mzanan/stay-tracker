"use client";

import { DeleteTripButton } from "@/components/Tracker/DeleteTripButton";
import { useTripForm } from "@/components/Tracker/useTripForm";
import type { TrackerActions } from "@/components/Tracker/useTracker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/ui/countrySelect";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { LocalStay } from "@/lib/storage/localTrips";

interface TripFormProps {
  stay: LocalStay | null;
  today: string;
  actions: TrackerActions;
  onDone: () => void;
}

export function TripForm({ stay, today, actions, onDone }: TripFormProps) {
  const form = useTripForm({ stay, today, actions, onDone });

  return (
    <form onSubmit={form.submit} className="flex flex-col gap-5 p-4" noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="trip-country">Country</FieldLabel>
          <CountrySelect
            id="trip-country"
            options={form.countries}
            value={form.country}
            onValueChange={form.setCountry}
            placeholder="Choose a Schengen country"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="trip-entry">Entry date</FieldLabel>
          <Input
            id="trip-entry"
            type="date"
            fieldSize="lg"
            required
            max={form.latestDay}
            value={form.entryDate}
            onChange={(event) => form.setEntryDate(event.target.value)}
            onBlur={form.checkExit}
          />
        </Field>
        <Field orientation="horizontal" className="min-h-11">
          <Checkbox
            id="trip-still-there"
            checked={form.stillThere}
            onCheckedChange={(checked) => form.setStillThere(checked === true)}
          />
          <FieldLabel htmlFor="trip-still-there" className="min-h-11 flex-1 items-center text-base">
            I am still there
          </FieldLabel>
        </Field>
        {!form.stillThere && (
          <Field data-invalid={form.exitError !== null}>
            <FieldLabel htmlFor="trip-exit">Exit date</FieldLabel>
            <Input
              id="trip-exit"
              type="date"
              fieldSize="lg"
              aria-invalid={form.exitError !== null}
              max={form.latestDay}
              value={form.exitDate}
              onChange={(event) => form.setExitDate(event.target.value)}
              onBlur={form.checkExit}
            />
            <FieldError>{form.exitError}</FieldError>
          </Field>
        )}
      </FieldGroup>
      <FieldError>{form.formError}</FieldError>
      <div className="flex flex-col gap-2">
        <Button type="submit" size="xl">
          Save trip
        </Button>
        {stay && <DeleteTripButton onConfirm={form.remove} />}
      </div>
    </form>
  );
}
