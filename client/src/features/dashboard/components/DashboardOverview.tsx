import {
AlertCircle,
Box,
Clock,
DollarSign,
ShoppingCart,
Users,
} from "lucide-react";

import type {
DashboardOverview as DashboardOverviewType,
} from "../dashboard.types";

interface DashboardOverviewProps {
overview: DashboardOverviewType;
}

const DashboardOverview = ({
overview,
}: DashboardOverviewProps) => {
const cards = [
{
label: "Total Sales",
value: `Rs. ${overview.totalSales.toLocaleString()}`,
icon: DollarSign,
},
{
label: "Total Orders",
value: overview.totalOrders.toLocaleString(),
icon: ShoppingCart,
},
{
label: "Customers",
value: overview.totalCustomers.toLocaleString(),
icon: Users,
},
{
label: "Products",
value: overview.totalProducts.toLocaleString(),
icon: Box,
},
{
label: "Pending Orders",
value: overview.pendingOrders.toLocaleString(),
icon: Clock,
},
{
label: "Processing Orders",
value: overview.processingOrders.toLocaleString(),
icon: AlertCircle,
},
];

return (
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
{cards.map((card) => {
const Icon = card.icon;

    return (
      <div
        key={card.label}
        className="rounded-xl border bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {card.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-3">
            <Icon className="h-5 w-5 text-gray-700" />
          </div>
        </div>
      </div>
    );
  })}
</div>

);
};

export default DashboardOverview;