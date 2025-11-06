import { Permissions } from "@/services/permission.service";

// utils/get-initials.ts
export const getInitials = (name: string = "") => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const groupPermissionsByModule = (permissions: Permissions[]) => {
  return permissions.reduce((acc, permission) => {
    // eslint-disable-next-line @next/next/no-assign-module-variable
    const module = permission.module || "GENERAL";
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permissions[]>);
};
