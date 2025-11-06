"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RoleDetails, Roles } from "@/services/role.service";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { groupPermissionsByModule } from "@/utils/get-initial";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarCog,
  CalendarPlus,
  Shield,
  UserRoundCog,
  UserRoundPen,
} from "lucide-react";

interface ViewRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleDetails | null;
}

export function ViewRoleModal({ isOpen, onClose, role }: ViewRoleModalProps) {
  if (!role) return null;
  const groupedPermissions = groupPermissionsByModule(role.permissions || []);

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      POST: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
      PUT: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      PATCH:
        "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      DELETE: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    };
    return colors[method] || "bg-gray-500/10 text-gray-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Role Details: {role.name}</DialogTitle>
          <DialogDescription>
            View complete information and permissions for this role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground">
                {role.description || "N/A"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge
                className={cn(role.isActive ? "bg-green-500" : "bg-gray-500")}
              >
                {role.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">System Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <div className="flex justify-center items-center gap-2">
                  <CalendarPlus className="size-4" />
                  <span className="text-muted-foreground">Created:</span>
                </div>
                <span className="font-medium">
                  {format(new Date(role.createdAt), "MMM d, yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <div className="flex justify-center items-center gap-2">
                  <CalendarCog className="size-4" />

                  <span className="text-muted-foreground">Last Updated:</span>
                </div>
                <span className="font-medium">
                  {format(new Date(role.updatedAt), "MMM d, yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <div className="flex justify-center items-center gap-2">
                  <Shield className="size-4" />
                  <span className="text-muted-foreground">Role ID:</span>
                </div>
                <span className="font-mono">{role.id}</span>
              </div>
            </div>
          </div>

          {(role.createdById || role.updatedById) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Audit Information</h3>
                <div className="space-y-2 text-sm">
                  {role.createdById && (
                    <div className="flex justify-between">
                      <div className="flex justify-center items-center gap-2">
                        <UserRoundPen className="size-4" />
                        <span className="text-muted-foreground">
                          Created By:
                        </span>
                      </div>
                      <span className="font-mono">{role.createdById}</span>
                    </div>
                  )}
                  {role.updatedById && (
                    <div className="flex justify-between">
                      <div className="flex justify-center items-center gap-2">
                        <UserRoundCog className="size-4" />
                        <span className="text-muted-foreground">
                          Updated By:
                        </span>
                      </div>
                      <span className="font-mono">{role.updatedById}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">
              Permissions ({role.permissions.length})
            </h3>
            {role.permissions.length > 0 ? (
              <div className="border rounded-md">
                <Accordion type="multiple" className="w-full">
                  {Object.entries(groupedPermissions).map(
                    ([moduleName, perms]) => (
                      <AccordionItem key={moduleName} value={moduleName}>
                        <AccordionTrigger className="px-4 hover:no-underline">
                          {moduleName}
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {perms.map((perm) => (
                              <div
                                key={perm.id}
                                className="p-3 bg-muted rounded-md"
                              >
                                <p className="font-medium text-sm ml-1 mb-1">
                                  {perm.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge
                                    className={cn(
                                      "text-xs font-semibold",
                                      getMethodColor(perm.method)
                                    )}
                                  >
                                    {perm.method}
                                  </Badge>
                                  <span className="font-mono">{perm.path}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  )}
                </Accordion>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                This role has no permissions.
              </p>
            )}
          </div>
        </div>
        {/* === KẾT THÚC THAY ĐỔI === */}
      </DialogContent>
    </Dialog>
  );
}
