import { TriangleAlertIcon } from "lucide-react";

import { Alert, AlertTitle } from "@/components/ui/alert";

interface DataLossNoticeProps {
  message: string;
}

export function DataLossNotice({ message }: DataLossNoticeProps) {
  return (
    <Alert variant="overstay">
      <TriangleAlertIcon />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
