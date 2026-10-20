import { InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LocalDataBanner() {
  return (
    <Alert variant="notice">
      <InfoIcon />
      <AlertTitle>Your trips are only saved in this browser.</AlertTitle>
      <AlertDescription>Your browser may clear them, and they do not sync to other devices.</AlertDescription>
    </Alert>
  );
}
