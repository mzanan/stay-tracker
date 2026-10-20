"use client";

import { usePassportChoice } from "@/components/Tracker/usePassportChoice";
import type { TrackerActions } from "@/components/Tracker/useTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountrySelect } from "@/components/ui/countrySelect";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Title } from "@/components/ui/title";
import type { LocalPassport } from "@/lib/storage/localTrips";

const NO_PASSPORTS: LocalPassport[] = [];

interface FirstUseProps {
  actions: TrackerActions;
  onAddFirstTrip: () => void;
}

export function FirstUse({ actions, onAddFirstTrip }: FirstUseProps) {
  const passport = usePassportChoice(NO_PASSPORTS, actions);

  return (
    <Card size="lg">
      <CardContent className="flex flex-col gap-4">
        <Eyebrow>Schengen 90/180</Eyebrow>
        <Title as="h1">How many days do you have left in Schengen?</Title>
        <p className="text-sm text-muted-foreground">
          You can stay 90 days in any 180-day period. Add your trips and see how long you can stay and
          when you can come back.
        </p>
        <Field data-invalid={passport.error !== null}>
          <FieldLabel htmlFor="first-passport">Your passport</FieldLabel>
          <CountrySelect
            id="first-passport"
            options={passport.options}
            value={passport.country}
            onValueChange={passport.choose}
            placeholder="Choose your passport"
            invalid={passport.error !== null}
          />
          <FieldError>{passport.error}</FieldError>
        </Field>
        <div className="flex flex-col gap-2">
          <Button size="xl" onClick={() => passport.add(onAddFirstTrip)}>
            Add my first trip
          </Button>
          <Button variant="outline" size="xl" onClick={() => passport.add()}>
            I have not been in Schengen in the last 180 days
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
