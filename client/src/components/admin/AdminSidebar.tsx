import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";

import { useLogout } from "../../features/auth/useAuth";
import AdminChatBadge from "../../features/chat/components/AdminChatBadge";
import ChatSoundToggle from "../../features/chat/components/ChatSoundToggle";
import BrowserNotificationToggle from "../../features/chat/components/BrowserNotificationToggle";

const navigation = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    name: "Categories",
    path: "/admin/categories",
    icon: FolderTree,
  },
  {
    name: "Inventory",
    path: "/admin/inventory",
    icon: Boxes,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    name: "Chat",
    path: "/admin/chat",
    icon: MessageSquare,
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/login", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5 shrink-0" />

              <span className="flex-1">{item.name}</span>

              {/* Global unread chat badge */}
              {item.path === "/admin/chat" && <AdminChatBadge />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t p-4">
        <div className="mb-3 flex justify-center">
          <ChatSoundToggle />
          <BrowserNotificationToggle />
        </div>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            navigate("/");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Store className="h-5 w-5" />
          Back to Store
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
