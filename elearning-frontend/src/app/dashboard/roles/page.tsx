"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import RolesTable from "./_components/data-table-role";
// import PermissionsTable from "./_components/data-table-permission";
import { Shield, Key } from "lucide-react";
import RolesTable from "./_components/data-table-role";
import PermissionsTable from "./_components/data-table-permission";

function RolesPage() {
  return (
    <section className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage system roles and their permissions here.
        </p>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RolesTable />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsTable />
        </TabsContent>
      </Tabs>
    </section>
  );
}

export default RolesPage;
