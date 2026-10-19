
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { useAdminCustomers } from "../../../features/customers/useAdminCustomers";

const AdminCustomersPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } =
    useAdminCustomers({
      search: search || undefined,
      page,
      limit: 10,
    });

  // Avoid displaying stale results while a new page or search loads.
  const isUpdating = isFetching && !isLoading;
  const customers = isUpdating ? [] : (data?.data ?? []);
  const pagination = data?.pagination;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Customers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View registered customers and their order activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search customers by name or email..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Search
          </button>

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading || isUpdating ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading customers...
          </div>
        ) : isError ? (
          <div className="space-y-3 p-10 text-center">
            <p className="text-sm text-red-600">
              Failed to load customers.
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="text-sm font-medium underline"
            >
              Try again
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Users size={34} className="text-gray-400" />

            <h2 className="font-semibold text-gray-900">
              No customers found
            </h2>

            <p className="text-sm text-gray-500">
              {search
                ? "Try searching with a different name or email."
                : "Registered customers will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Account</th>
                    <th className="px-5 py-4">Orders</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {customer.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            customer.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {customer.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {customer.totalOrders}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {new Date(
                          customer.createdAt,
                        ).toLocaleDateString("en-NP")}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/customers/${customer.id}`}
                          className="font-medium text-gray-900 underline-offset-4 hover:underline"
                        >
                          View profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of{" "}
                  {Math.max(1, pagination.totalPages)} ·{" "}
                  {pagination.total} customers
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() =>
                      setPage((current) => current - 1)
                    }
                    className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >= pagination.totalPages || isFetching
                    }
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersPage;
