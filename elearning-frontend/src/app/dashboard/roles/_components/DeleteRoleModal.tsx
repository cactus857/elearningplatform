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
import { deleteRole, Roles } from "@/services/role.service";
import { getErrorMessage } from "@/utils/error-message";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface DeleteRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: Roles | null;
}

export function DeleteRoleDialog({
  isOpen,
  onClose,
  onSuccess,
  role,
}: DeleteRoleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!role) return;

    setIsDeleting(true);
    try {
      await deleteRole(role.id);
      toast.success("Role deleted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to delete role", {
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
            This action cannot be undone. This will permanently delete the role{" "}
            <strong>{role?.name}</strong> and remove it from our servers.
            {role?.description && (
              <span className="block mt-2 text-sm">
                Description: {role.description}
              </span>
            )}
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
