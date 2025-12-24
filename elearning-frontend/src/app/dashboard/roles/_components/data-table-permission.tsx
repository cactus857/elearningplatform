"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  Plus,
} from "lucide-react";

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
import {
  getAllModules,
  getAllPermissions,
  Permissions,
} from "@/services/permission.service";
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
import { AddPermissionModal } from "./AddPermissionModal";
import { EditPermissionModal } from "./EditPermissionModal";
import { ViewPermissionModal } from "./ViewPermissionModal";
import { DeletePermissionDialog } from "./DeletePermissionDialog";

export default function PermissionsTable() {
  const id = useId();

  const [data, setData] = useState<Permissions[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [moduleFilter, setModuleFilter] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const filterChangedRef = useRef(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permissions | null>(null);

  // Get unique modules for filter
  const [modules, setModules] = useState<{ module: string }[]>([]);

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      POST: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
      PUT: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      PATCH:
        "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      DELETE: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    };
    return colors[method] || "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  };

  const columns: ColumnDef<Permissions>[] = [
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Permission Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      header: "Module",
      accessorKey: "module",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.getValue("module")}
        </Badge>
      ),
    },
    {
      header: "Path",
      accessorKey: "path",
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {row.getValue("path")}
        </code>
      ),
    },
    {
      header: "Method",
      accessorKey: "method",
      cell: ({ row }) => {
        const method = row.getValue("method") as string;
        return (
          <Badge
            variant="outline"
            className={cn(
              "rounded-full border-none font-mono",
              getMethodColor(method)
            )}
          >
            {method}
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
    },
    {
      header: "",
      accessorKey: "actions",
      cell: ({ row }) => {
        const permission = row.original;
        return (
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
                onClick={() => {
                  navigator.clipboard.writeText(permission.id);
                  toast.success("Permission ID copied to clipboard!");
                }}
              >
                <IconCopy />
                Copy Permission ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-blue-400"
                onClick={() => {
                  setSelectedPermission(permission);
                  setIsViewModalOpen(true);
                }}
              >
                <IconEye />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-yellow-600"
                onClick={() => {
                  setSelectedPermission(permission);
                  setIsEditModalOpen(true);
                }}
              >
                <IconEdit />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedPermission(permission);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <IconTrash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const fetchModules = async () => {
    try {
      const result = await getAllModules();
      setModules(result);
    } catch (error) {
      toast.error("Failed to fetch modules");
    }
  };
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const responseData = await getAllPermissions(
        pagination.pageIndex + 1,
        pagination.pageSize,
        moduleFilter
      );
      setData(responseData.data);
      setTotalItems(responseData.totalItems);
      setPageCount(Math.ceil(responseData.totalItems / pagination.pageSize));
    } catch (error) {
      toast.error("Failed to fetch permissions", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterChangedRef.current = true;
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [moduleFilter]);

  // Khi pageIndex, pageSize, hoặc filter thay đổi → fetch data
  useEffect(() => {
    // Nếu filter vừa đổi, chỉ fetch sau khi pageIndex thực sự = 0
    if (filterChangedRef.current && pagination.pageIndex !== 0) {
      return; // chặn fetch sai
    }

    fetchPermissions();

    // Reset flag sau khi fetch đúng
    filterChangedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, moduleFilter]);

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
    pageCount,
  });

  const handleSuccess = () => {
    fetchPermissions();
    fetchModules();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          All permissions{" "}
          <span className="text-muted-foreground font-normal">
            {totalItems}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((item) => (
                  <SelectItem key={item.module} value={item.module}>
                    {item.module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {moduleFilter && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setModuleFilter("")}
                className="text-foreground"
              >
                <IconTrash />
                Clear
              </Button>
            )}
          </div>

          <Button type="button" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add permission
          </Button>

          <Button type="button" variant={"outline"} onClick={fetchPermissions}>
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
                    <span className="ml-2">Loading permissions...</span>
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
                  No permissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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

          <div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronFirstIcon size={16} />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeftIcon size={16} />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRightIcon size={16} />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronLastIcon size={16} />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddPermissionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditPermissionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPermission(null);
        }}
        onSuccess={handleSuccess}
        permission={selectedPermission}
      />

      <ViewPermissionModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPermission(null);
        }}
        permission={selectedPermission}
      />

      <DeletePermissionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPermission(null);
        }}
        onSuccess={handleSuccess}
        permission={selectedPermission}
      />
    </div>
  );
}
