"use client";

import { useEffect, useId, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  MoreVertical,
  Search,
  Plus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getAllUsers, Users } from "@/services/user.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error-message";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconCopy,
  IconEdit,
  IconEye,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { getAllRoles, Roles } from "@/services/role.service";
import { AddUserModal } from "./AddUserModal";
import { EditUserModal } from "./UpdateUserModal";
import { ViewUserModal } from "./ViewUserModal";
import { DeleteUserDialog } from "./DeleteUserDialog";

export default function UsersTable() {
  const id = useId();

  const [data, setData] = useState<Users[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [roleFilter, setRoleFilter] = useState("");

  const [roles, setRoles] = useState<Roles[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);

  const columns: ColumnDef<Users>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 28,
      enableSorting: false,
    },
    {
      header: "User Information",
      accessorKey: "fullName",
      cell: ({ row }) => {
        const { fullName, avatar, email } = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar ?? undefined} alt={fullName} />
              <AvatarFallback>{fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{fullName}</div>
              <div className="text-sm text-muted-foreground">{email}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Phone Number",
      accessorKey: "phoneNumber",
      cell: ({ row }) => <div>{row.getValue("phoneNumber")}</div>,
    },
    {
      header: "Role",
      accessorKey: "role.name",
      cell: ({ row }) => {
        const roleName = row.original.role.name;

        const styles = {
          ADMIN:
            "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
          INSTRUCTOR:
            "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
          STUDENT:
            "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
        };
        const roleStyle = styles[roleName as keyof typeof styles];
        return (
          <Badge
            variant="outline"
            className={cn("rounded-full border-none", roleStyle)}
          >
            {roleName.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const styles = {
          ACTIVE:
            "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
          INACTIVE:
            "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
        }[status];
        return (
          <Badge className={cn("rounded-full border-none", styles)}>
            {status}
          </Badge>
        );
      },
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div>{format(date, "MMM d, yyyy")}</div>;
      },
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
    },
    {
      header: "",
      accessorKey: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-bold">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user.id)}
                >
                  <IconCopy />
                  Copy Brand ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-blue-400"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsViewModalOpen(true);
                  }}
                >
                  <IconEye />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-yellow-600"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsEditModalOpen(true);
                  }}
                >
                  <IconEdit />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <IconTrash />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getAllRoles(1, 20);
        setRoles(rolesData.data);
      } catch (error) {
        toast.error("Failed to fetch roles", {
          description: getErrorMessage(error),
        });
      } finally {
        setIsLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const responseData = await getAllUsers(
        pagination.pageIndex + 1,
        pagination.pageSize,
        debouncedSearchQuery,
        roleFilter
      );
      setData(responseData.data);
      setTotalItems(responseData.totalItems);
    } catch (error) {
      toast.error("Failed to fetch users", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearchQuery,
    pagination.pageIndex,
    pagination.pageSize,
    roleFilter,
  ]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery, roleFilter]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil(totalItems / pagination.pageSize),
  });

  const handleSuccess = () => {
    fetchUsers();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            All users{" "}
            <span className="text-muted-foreground font-normal">
              {totalItems}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
                disabled={isLoadingRoles}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="ALL_ROLES">All Roles</SelectItem> */}
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name.charAt(0) + role.name.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {roleFilter && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setRoleFilter("")}
                  className="text-foreground"
                >
                  <IconTrash />
                  Clear
                </Button>
              )}
            </div>

            <Button type="button" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add user
            </Button>

            <Button type="button" variant={"outline"} onClick={fetchUsers}>
              <IconRefresh className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-11 cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && (
                        <ChevronUpIcon className="inline ml-1 h-4 w-4 opacity-60" />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ChevronDownIcon className="inline ml-1 h-4 w-4 opacity-60" />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <LoadingSpinner />
                      <span className="ml-2">Loading users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Label htmlFor={id} className="max-sm:sr-only whitespace-nowrap">
              Rows per page
            </Label>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent>
                {[10, 15, 20, 25].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-muted-foreground text-sm whitespace-nowrap">
              {totalItems > 0 ? (
                <p aria-live="polite">
                  <span className="text-foreground font-medium">
                    {pagination.pageIndex * pagination.pageSize + 1}-
                    {Math.min(
                      (pagination.pageIndex + 1) * pagination.pageSize,
                      totalItems
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-foreground font-medium">
                    {totalItems}
                  </span>
                </p>
              ) : (
                <p>No items to display</p>
              )}
            </div>

            {/* Pagination Buttons */}
            <div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => table.firstPage()}
                      disabled={!table.getCanPreviousPage()}
                      aria-label="Go to first page"
                    >
                      <ChevronFirstIcon size={16} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      aria-label="Go to previous page"
                    >
                      <ChevronLeftIcon size={16} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      aria-label="Go to next page"
                    >
                      <ChevronRightIcon size={16} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => table.lastPage()}
                      disabled={!table.getCanNextPage()}
                      aria-label="Go to last page"
                    >
                      <ChevronLastIcon size={16} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleSuccess}
        user={selectedUser}
      />

      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleSuccess}
        user={selectedUser}
      />
    </>
  );
}
