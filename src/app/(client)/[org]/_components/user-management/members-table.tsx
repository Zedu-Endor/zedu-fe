import React, { useContext, useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import Icons from "~/app/(client)/[org]/_components/billing/icons";
import { cn } from "~/lib/utils";
import UserAvatar from "~/components/layout/user-avatar";
import { DeactivationBadge } from "~/components/layout/deactivation-badge";
import TableEmptyState from "../table-empty-state";
import { Member } from "./type";
import { Pencil, Search, Trash2, UserCheck, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import EditMemberRoleModal from "./edit-member-role-modal";
import RestrictMemberModal from "./restrict-user-access-modal";
import { DataContext } from "~/store/GlobalState";
import Loading from "~/components/ui/loading";
import TablePagination from "./table-pagination";
import { useRBAC } from "~/hooks/useRBAC";

interface MembersTableProps {
  membersData: Member[];
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onMemberRoleUpdated?: (memberId: string, roleName: string) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    setPage: (index: number) => void;
    setPageSize: (size: number) => void;
  };
}

export default function MembersTable({
  membersData = [],
  isLoading = false,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onMemberRoleUpdated,
  pagination,
}: MembersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [isOpenEditMemberModal, setIsOpenEditMemberModal] =
    useState<boolean>(false);
  const [isOpenRestrictMemberModal, setIsOpenRestrictMemberModal] =
    useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSearchChange(debouncedSearchValue);
  }, [debouncedSearchValue]);

  const { state } = useContext(DataContext);
  const { orgRoles } = state;
  const { hasPermission } = useRBAC();
  const canChangeRole = hasPermission("change:user_org_role");
  const canManageMembers =
    hasPermission("remove:people") || hasPermission("manage:members");
  const showMemberActions = canChangeRole || canManageMembers;

  const getMemberDisplayName = (member: Member) => {
    return (
      member.name ||
      member.profile?.name ||
      member.username ||
      member.email?.split("@")[0] ||
      "Member"
    );
  };

  const isMemberInactive = (member: Member) => {
    return (
      member.status === "inactive" ||
      member.status === "deactivated" ||
      member.is_deactivated === true
    );
  };

  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "active";
    return (
      <div
        className={cn(
          "flex gap-1.5 w-fit px-2 py-1 rounded-md items-center border",
          {
            "border-green-100 text-green-700 bg-green-50/50 dark:border-green-700/50 dark:text-green-400 dark:bg-green-950/20":
              normalizedStatus === "active",
            "border-red-100 text-red-700 bg-red-50/50 dark:border-red-700/50 dark:text-red-400 dark:bg-red-950/20":
              normalizedStatus === "inactive",
            "border-blue-100 text-blue-700 bg-blue-50/50 dark:border-blue-700/50 dark:text-blue-400 dark:bg-blue-950/20":
              normalizedStatus === "invited",
            "border-yellow-100 text-yellow-700 bg-yellow-50/50 dark:border-yellow-700/50 dark:text-yellow-400 dark:bg-yellow-950/20":
              normalizedStatus === "pending",
            "border-gray-200 text-gray-700 bg-gray-50/50 dark:border-zinc-700 dark:text-zinc-300 dark:bg-zinc-800/40":
              normalizedStatus === "deactivated",
          }
        )}
      >
        <div
          className={cn("w-1.5 h-1.5 rounded-full", {
            "bg-red-500": normalizedStatus === "inactive",
            "bg-green-500": normalizedStatus === "active",
            "bg-blue-500": normalizedStatus === "invited",
            "bg-yellow-500": normalizedStatus === "pending",
            "bg-gray-500": normalizedStatus === "deactivated",
          })}
        />
        <span className="capitalize text-xs font-medium">
          {normalizedStatus}
        </span>
      </div>
    );
  };

  const renderActionButtons = (member: Member) => {
    const inactive = isMemberInactive(member);

    return (
      <div className="flex items-center gap-2">
        {canChangeRole && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Edit role"
                className="h-8 w-8 p-1 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                onClick={() => {
                  setIsOpenEditMemberModal(true);
                  setSelectedMember(member);
                }}
              >
                <Pencil size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Edit role</p>
            </TooltipContent>
          </Tooltip>
        )}
        {canManageMembers && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={
                  inactive ? "Reactivate member" : "Deactivate member"
                }
                className={cn(
                  "h-8 w-8 p-1 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
                  inactive
                    ? "text-green-600 hover:text-green-700 dark:text-green-400"
                    : "text-gray-700 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400"
                )}
                onClick={() => {
                  setIsOpenRestrictMemberModal(true);
                  setSelectedMember(member);
                }}
              >
                {inactive ? <UserCheck size={16} /> : <Trash2 size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{inactive ? "Reactivate member" : "Deactivate member"}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "name",
      id: "member",
      accessorFn: (row) =>
        `${getMemberDisplayName(row)} ${row.email} ${row.username || ""}`,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const query = String(filterValue).toLowerCase().trim();
        const displayName = getMemberDisplayName(row.original).toLowerCase();
        const email = String(row.original.email ?? "").toLowerCase();
        const username = String(row.original.username ?? "").toLowerCase();
        return (
          displayName.includes(query) ||
          email.includes(query) ||
          username.includes(query)
        );
      },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085] dark:text-zinc-400"
        >
          Members
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => {
        const displayName = getMemberDisplayName(row.original);
        return (
          <div className="flex items-center gap-3">
            <UserAvatar
              item={row.original}
              size="xs"
              alt={displayName}
              className="rounded-md shrink-0"
              imageClassName="rounded-md"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-gray-900 dark:text-zinc-100 truncate text-sm">
                {displayName}
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 inline-flex items-center gap-1.5 truncate">
                {row.original.email}
                <DeactivationBadge user={row.original} size="sm" />
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        const role = String(row.getValue(columnId) ?? "").toLowerCase();
        return role === String(filterValue).toLowerCase();
      },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085] dark:text-zinc-400"
        >
          Role
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-zinc-300 text-sm capitalize">
          {row.getValue("role") || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085] dark:text-zinc-400"
        >
          Date Joined
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-zinc-300 text-sm">
          {row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        const status = (row.getValue(columnId) as string)?.toLowerCase();
        if (filterValue === "deactivated") {
          return (
            status === "deactivated" ||
            status === "inactive" ||
            row.original.is_deactivated === true
          );
        }
        return status === filterValue.toLowerCase();
      },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085] dark:text-zinc-400"
        >
          Status
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => renderStatusBadge(row.original.status),
    },
    ...(showMemberActions
      ? [
          {
            accessorKey: "action",
            header: () => (
              <div className="text-[#667085] dark:text-zinc-400 font-medium text-sm">
                Actions
              </div>
            ),
            cell: ({ row }: { row: { original: Member } }) =>
              renderActionButtons(row.original),
          } as ColumnDef<Member>,
        ]
      : []),
  ];

  const table = useReactTable({
    data: membersData,
    columns,
    pageCount: pagination.pageCount,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const nextState =
        typeof updater === "function"
          ? updater({
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
            })
          : updater;

      if (nextState.pageIndex !== pagination.pageIndex) {
        pagination.setPage(nextState.pageIndex);
      }
      if (nextState.pageSize !== pagination.pageSize) {
        pagination.setPageSize(nextState.pageSize);
      }
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  const currentPage = pagination.pageIndex + 1;
  const totalPages = pagination.pageCount;

  const activeRole =
    (table.getColumn("role")?.getFilterValue() as string) || "all";
  const activeStatus =
    (table.getColumn("status")?.getFilterValue() as string) || "all";
  const hasActiveFilters =
    searchValue.trim() !== "" ||
    (activeRole !== "all" && activeRole !== "") ||
    (activeStatus !== "all" && activeStatus !== "");

  const clearAllFilters = () => {
    setSearchValue("");
    onSearchChange("");
    table.getColumn("member")?.setFilterValue(undefined);
    table.getColumn("role")?.setFilterValue("");
    onRoleChange("");
    table.getColumn("status")?.setFilterValue("");
    onStatusChange?.("");
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 mt-6 rounded-xl overflow-hidden py-16 flex justify-center items-center">
        <Loading color="blue" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 mt-6 rounded-xl overflow-hidden shadow-sm">
        <EditMemberRoleModal
          isOpen={isOpenEditMemberModal}
          onClose={() => setIsOpenEditMemberModal(false)}
          selectedMember={selectedMember}
          onMemberRoleUpdated={onMemberRoleUpdated}
        />
        <RestrictMemberModal
          isOpen={isOpenRestrictMemberModal}
          onClose={() => setIsOpenRestrictMemberModal(false)}
          selectedMember={selectedMember}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                size={16}
              />
              <Input
                placeholder="Search by name or email"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 w-full sm:w-[240px] md:w-[300px] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
              />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Select
                value={
                  (table.getColumn("role")?.getFilterValue() as string) || "all"
                }
                onValueChange={(v) => {
                  const val = v === "all" ? "" : v;
                  table.getColumn("role")?.setFilterValue(val);
                  onRoleChange(val);
                }}
              >
                <SelectTrigger className="w-fit min-w-[120px] gap-3 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                  <SelectItem value="all">All Roles</SelectItem>
                  {orgRoles?.map((role: any) => (
                    <SelectItem key={role.id} value={role.name.toLowerCase()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={
                  (table.getColumn("status")?.getFilterValue() as string) ||
                  "all"
                }
                onValueChange={(v) => {
                  const val = v === "all" ? "" : v;
                  table.getColumn("status")?.setFilterValue(val);
                  onStatusChange?.(val);
                }}
              >
                <SelectTrigger className="w-fit min-w-[130px] gap-3 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gray-50/70 dark:bg-zinc-900/40 border-b border-gray-100 dark:border-zinc-800 flex-wrap text-xs">
            <span className="text-gray-500 dark:text-zinc-400 font-medium">
              Active filters:
            </span>
            {searchValue.trim() !== "" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Search: &quot;{searchValue}&quot;
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    onSearchChange("");
                    table.getColumn("member")?.setFilterValue(undefined);
                  }}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {activeRole !== "all" && activeRole !== "" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 capitalize">
                Role: {activeRole}
                <button
                  type="button"
                  onClick={() => {
                    table.getColumn("role")?.setFilterValue("");
                    onRoleChange("");
                  }}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                  aria-label="Clear role filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {activeStatus !== "all" && activeStatus !== "" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 capitalize">
                Status: {activeStatus}
                <button
                  type="button"
                  onClick={() => {
                    table.getColumn("status")?.setFilterValue("");
                    onStatusChange?.("");
                  }}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                  aria-label="Clear status filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {membersData.length > 0 || searchValue !== "" ? (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow
                      key={hg.id}
                      className="bg-gray-50 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800"
                    >
                      {hg.headers.map((h) => (
                        <TableHead
                          key={h.id}
                          className="text-[#667085] dark:text-zinc-400 font-medium"
                        >
                          {flexRender(
                            h.column.columnDef.header,
                            h.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3">
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
                        className="h-28 text-center text-gray-500 dark:text-zinc-400"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <p>
                            No members found
                            {searchValue ? ` for "${searchValue}"` : ""}.
                          </p>
                          {hasActiveFilters && (
                            <button
                              type="button"
                              onClick={clearAllFilters}
                              className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-zinc-700 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View (< 768px) */}
            <div className="block md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const member = row.original;
                  const displayName = getMemberDisplayName(member);

                  return (
                    <div
                      key={row.id}
                      className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar
                            item={member}
                            size="sm"
                            alt={displayName}
                            className="rounded-md shrink-0"
                            imageClassName="rounded-md"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-900 dark:text-zinc-100 truncate text-sm">
                              {displayName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-zinc-400 inline-flex items-center gap-1.5 truncate">
                              {member.email}
                              <DeactivationBadge user={member} size="sm" />
                            </span>
                          </div>
                        </div>
                        {showMemberActions && renderActionButtons(member)}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 pt-2 border-t border-gray-100 dark:border-zinc-800/60">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-700 dark:text-zinc-300">
                            Role:
                          </span>
                          <span className="capitalize">
                            {member.role || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(member.status)}
                          {member.created_at && (
                            <span className="text-[11px]">
                              {new Date(member.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-zinc-400 text-sm">
                  No members found
                  {searchValue ? ` for "${searchValue}"` : ""}.
                </div>
              )}
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              canPrevious={table.getCanPreviousPage()}
              canNext={table.getCanNextPage()}
              onPageChange={(page) => table.setPageIndex(page - 1)}
            />
          </>
        ) : (
          <TableEmptyState
            title="No members found."
            description="Your members will appear here once you invite them."
          />
        )}
      </div>
    </TooltipProvider>
  );
}
