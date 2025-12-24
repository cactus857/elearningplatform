"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Permissions } from "@/services/permission.service";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ViewPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permissions | null;
}

export function ViewPermissionModal({
  isOpen,
  onClose,
  permission,
}: ViewPermissionModalProps) {
  if (!permission) return null;

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      POST: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      PUT: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
      PATCH:
        "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
      DELETE: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    };
    return colors[method] || "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Permission Details</DialogTitle>
          <DialogDescription>
            View complete information about this permission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Permission Name */}
          <div>
            <h3 className="text-xl font-semibold">{permission.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="font-mono">
                {permission.module}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full border-none font-mono",
                  getMethodColor(permission.method)
                )}
              >
                {permission.method}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Permission Information */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                API Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Module:</span>
                  <Badge variant="outline" className="font-mono">
                    {permission.module}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Path:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {permission.path}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Method:</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border-none font-mono",
                      getMethodColor(permission.method)
                    )}
                  >
                    {permission.method}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                System Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Created:
                  </span>
                  <span className="text-sm font-medium">
                    {format(
                      new Date(permission.createdAt),
                      "MMM d, yyyy HH:mm"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Updated:
                  </span>
                  <span className="text-sm font-medium">
                    {format(
                      new Date(permission.updatedAt),
                      "MMM d, yyyy HH:mm"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Permission ID:
                  </span>
                  <span className="text-sm font-mono">{permission.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
