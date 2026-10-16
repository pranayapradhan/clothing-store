import { AlertCircle } from "lucide-react";

import DashboardOverview from "../../../features/dashboard/components/DashboardOverview";
import RecentOrders from "../../../features/dashboard/components/RecentOrders";
import LowStockTable from "../../../features/dashboard/components/LowStockTable";
import { useDashboard } from "../../../features/dashboard/useDashboard";

const AdminDashboardPage = () => {
const {
data,
isLoading,
isError,
refetch,
} = useDashboard();

if (isLoading) {
return (
<div className="space-y-6">
<div>
<div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
<div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
</div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-xl bg-gray-200"
        />
      ))}
    </div>
  </div>
);

}

if (isError || !data?.data) {
return (
<div className="flex min-h-[400px] items-center justify-center">
<div className="text-center">
<AlertCircle className="mx-auto h-10 w-10 text-gray-400" />

      <h2 className="mt-4 text-lg font-semibold text-gray-900">
        Failed to load dashboard
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Something went wrong while loading dashboard data.
      </p>

      <button
        type="button"
        onClick={() => refetch()}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        Try Again
      </button>
    </div>
  </div>
);

}

const dashboard = data.data;

return (
<div className="space-y-6">
<div>
<h2 className="text-2xl font-bold text-gray-900">
Dashboard
</h2>

    <p className="mt-1 text-sm text-gray-500">
      Overview of your store performance.
    </p>
  </div>

  <DashboardOverview
    overview={dashboard.overview}
  />
  <RecentOrders orders={dashboard.recentOrders} />

<LowStockTable items={dashboard.lowStock} />
</div>

);
};

export default AdminDashboardPage;