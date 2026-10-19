import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useChatSocket } from "../../features/chat/useChatSocket";
import { useChatNotifications } from "../../features/chat/useChatNotifications";
import { Toaster } from "sonner";
import { useAdminChatToasts } from "../../features/chat/useAdminChatToasts";
import { useChatAudioInitialization } from "../../features/chat/useChatAudioInitialization";

const AdminChatConnection = () => {
  useChatSocket(true);
  useChatNotifications();
  useAdminChatToasts();
  useChatAudioInitialization();

  return null;
};

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminChatConnection/>
      <Toaster position="top-right" richColors />
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">
        <AdminSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <AdminSidebar />
      </aside>

      <div className="lg:pl-64">
        <AdminNavbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
