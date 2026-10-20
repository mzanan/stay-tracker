"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

interface DeleteTripButtonProps {
  onConfirm: () => void;
}

export function DeleteTripButton({ onConfirm }: DeleteTripButtonProps) {
  const dialog = useConfirmDialog(onConfirm);
  return (
    <AlertDialog open={dialog.open} onOpenChange={dialog.setOpen}>
      <AlertDialogTrigger render={<Button type="button" variant="destructive" size="xl" />}>
        Delete trip
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="touch">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" size="touch" onClick={dialog.confirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
