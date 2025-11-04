import React from "react";
import UsersTable from "./_components/data-table-user";

function page() {
  return (
    <section className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">User Management</h1>
      <p className="text-muted-foreground">
        Manage your user members and their account permissions here.
      </p>
      <UsersTable />
    </section>
  );
}

export default page;
