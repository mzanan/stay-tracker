"use client";

import { InfoIcon, XIcon } from "lucide-react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDismissible } from "@/hooks/useDismissible";

export function LocalDataBanner() {
  const banner = useDismissible("local-data-banner");
  if (banner.dismissed) return null;
  return (
    <Alert variant="notice">
      <InfoIcon />
      <AlertTitle>Your trips are only saved in this browser.</AlertTitle>
      <AlertDescription>Your browser may clear them, and they do not sync to other devices.</AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="icon-touch" aria-label="Dismiss" onClick={banner.dismiss}>
          <XIcon />
        </Button>
      </AlertAction>
    </Alert>
  );
}
