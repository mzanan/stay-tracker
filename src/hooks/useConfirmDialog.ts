import { useState } from "react";

export function useConfirmDialog(onConfirm: () => void) {
  const [open, setOpen] = useState(false);
  const confirm = () => {
    setOpen(false);
    onConfirm();
  };
  return { open, setOpen, confirm };
}
