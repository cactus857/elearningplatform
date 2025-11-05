"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "@/services/user.service";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CalendarPlus,
  FingerprintIcon,
  HistoryIcon,
  LockKeyhole,
  Mail,
  Phone,
  ShieldUser,
} from "lucide-react";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Users | null;
}

export function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!user) return null;

  const statusStyles = {
    ACTIVE:
      "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    INACTIVE:
      "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
  };

  const roleStyles = {
    ADMIN:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    INSTRUCTOR:
      "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    STUDENT:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View complete information about this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
              <AvatarFallback className="text-lg">
                {user.fullName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.fullName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full border-none",
                    statusStyles[user.status]
                  )}
                >
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* User Information */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Contact Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <Mail className="size-4" />

                    <span className="text-sm text-muted-foreground">
                      Email:
                    </span>
                  </div>

                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex justify-between">
                    <div className="flex gap-2 items-center">
                      <Phone className="size-4" />
                      <span className="text-sm text-muted-foreground">
                        Phone:
                      </span>{" "}
                    </div>

                    <span className="text-sm font-medium">
                      {user.phoneNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Role & Permissions
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <ShieldUser className="size-4" />

                    <span className="text-sm text-muted-foreground">Role:</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border-none",
                      roleStyles[user.role.name as keyof typeof roleStyles]
                    )}
                  >
                    {user.role.name}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <LockKeyhole className="size-4" />

                    <span className="text-sm text-muted-foreground">
                      2FA Enabled:
                    </span>
                  </div>

                  <span className="text-sm font-medium">
                    {user.is2FAEnable ? (
                      <Badge className="rounded-full border-none bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                        Yes
                      </Badge>
                    ) : (
                      <Badge className="rounded-full border-none bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                        No
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Account Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <CalendarPlus className="size-4" />

                    <span className="text-sm text-muted-foreground">
                      Created:
                    </span>
                  </div>

                  <span className="text-sm font-medium">
                    {format(new Date(user.createdAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <HistoryIcon className="size-4" />

                    <span className="text-sm text-muted-foreground">
                      Last Updated:
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {format(new Date(user.updatedAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <FingerprintIcon className="size-4" />
                    <span className="text-sm text-muted-foreground">
                      User ID:
                    </span>
                  </div>
                  <span className="text-sm font-mono">{user.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
