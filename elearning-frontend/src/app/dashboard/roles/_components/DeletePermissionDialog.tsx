"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePermission, Permissions } from "@/services/permission.service";
import { getErrorMessage } from "@/utils/error-message";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface DeletePermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  permission: Permissions | null;
}

export function DeletePermissionDialog({
  isOpen,
  onClose,
  onSuccess,
  permission,
}: DeletePermissionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!permission) return;

    setIsDeleting(true);
    try {
      await deletePermission(permission.id);
      toast.success("Permission deleted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to delete permission", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            permission <strong>{permission?.name}</strong> (
            <code className="text-xs">
              {permission?.method} {permission?.path}
            </code>
            ) and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting && <LoadingSpinner />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
