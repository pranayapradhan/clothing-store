import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";

export default function ProtectedRoute() {
  const location = useLocation();

  const {
    data: user,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

          <p className="mt-4 text-sm text-gray-500">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  return <Outlet />;
}