import { Menu, Store, UserCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

const pageTitles: Record<string, string> = {
"/admin": "Dashboard",
"/admin/products": "Products",
"/admin/categories": "Categories",
"/admin/inventory": "Inventory",
"/admin/orders": "Orders",
"/admin/customers": "Customers",
"/admin/chat": "Chat",
};

interface AdminTopbarProps {
onMenuClick?: () => void;
}

const AdminNavbar = ({
onMenuClick,
}: AdminTopbarProps) => {
const location = useLocation();
const navigate = useNavigate();
const { data: user } = useAuth();

const title =
pageTitles[location.pathname] ?? "Admin Panel";

return (
<header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
<div className="flex items-center gap-3">
<button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden" aria-label="Open admin menu" >
<Menu className="h-5 w-5" />
</button>

    <div>
      <h1 className="text-lg font-semibold text-gray-900">
        {title}
      </h1>

      <p className="hidden text-xs text-gray-500 sm:block">
        Admin Panel
      </p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => navigate("/")}
      className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 sm:flex"
    >
      <Store className="h-4 w-4" />
      Store
    </button>

    <div className="flex items-center gap-2 border-l pl-3">
      <UserCircle className="h-7 w-7 text-gray-500" />

      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-gray-900">
          {user?.name ?? "Admin"}
        </p>

        <p className="text-xs text-gray-500">
          Administrator
        </p>
      </div>
    </div>
  </div>
</header>

);
};

export default AdminNavbar;