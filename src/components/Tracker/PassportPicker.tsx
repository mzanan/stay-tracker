"use client";

import { ChevronDownIcon, XIcon } from "lucide-react";

import { usePassportPicker } from "@/components/Tracker/usePassportPicker";
import type { TrackerActions } from "@/components/Tracker/useTracker";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "@/components/ui/countrySelect";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { countryName, passportsSummary } from "@/lib/countries";
import type { LocalPassport } from "@/lib/storage/localTrips";

interface PassportPickerProps {
  passports: LocalPassport[];
  locked: boolean;
  actions: TrackerActions;
}

export function PassportPicker({ passports, locked, actions }: PassportPickerProps) {
  const { open, openDrawer, onOpenChange, passport } = usePassportPicker(passports, actions);
  const summary = passportsSummary(passports.map((item) => item.country));

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Button
        variant="outline"
        size="touch"
        className="min-w-0 shrink"
        onClick={openDrawer}
        aria-label={`Your passports: ${passports.map((item) => countryName(item.country)).join(", ")}`}
      >
        <span className="truncate">{summary.name}</span>
        {summary.more && <span className="shrink-0">{summary.more}</span>}
        <ChevronDownIcon />
      </Button>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Your passports</DrawerTitle>
          <DrawerDescription>
            The 90/180 limit counts per person, not per passport. Any EU, EEA or Swiss passport means no limit.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-4">
          <ul className="flex flex-col divide-y divide-border">
            {passports.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2">
                <span className="text-base">{countryName(item.country)}</span>
                {locked ? (
                  <Button
                    variant="link"
                    size="touch"
                    className="px-0 text-sm text-muted-foreground"
                    onClick={() => passport.startChange(item.id)}
                  >
                    Wrong passport? Change it
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon-touch"
                    aria-label={`Remove ${countryName(item.country)} passport`}
                    onClick={() => passport.remove(item.id)}
                  >
                    <XIcon />
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <Field data-invalid={passport.error !== null}>
            <FieldLabel htmlFor="add-passport">
              {passport.changing ? "Your correct passport" : "Add a passport"}
            </FieldLabel>
            <CountrySelect
              id="add-passport"
              options={passport.options}
              value={passport.country}
              onValueChange={passport.choose}
              placeholder="Choose a country"
              invalid={passport.error !== null}
            />
            <FieldError>{passport.error}</FieldError>
          </Field>
          <Button size="xl" onClick={passport.submit}>
            {passport.changing ? "Change passport" : "Add passport"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
