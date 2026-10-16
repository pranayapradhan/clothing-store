import {
  LogOut,
  Mail,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  useAuth,
  useLogout,
} from "../../features/auth/useAuth";

export default function AccountPage() {
  const {
    data: user,
    isLoading,
    isError,
  } = useAuth();

  const navigate = useNavigate();
  const logout = useLogout();

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-40 rounded bg-gray-200" />

          <div className="mt-8 rounded-xl border border-gray-200 p-6">
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="mt-4 h-4 w-64 rounded bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="mx-auto flex min-h-[65vh] w-full max-w-md items-center justify-center px-4 py-16">
        <div className="w-full text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <User className="h-9 w-9 text-gray-400" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
            Welcome
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Sign in to manage your account,
            orders, cart, and wishlist.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-900 transition hover:border-black"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
  logout.mutate(undefined, {
    onSuccess: () => {
      navigate("/", {
        replace: true,
      });
    },
  });
};

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-gray-500">
          My Account
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
          Welcome, {user.name}
        </h1>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Name
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {user.name}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <Mail className="h-5 w-5 text-gray-600" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Email
              </p>

              <p className="mt-1 truncate text-sm font-medium text-gray-900">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 divide-y rounded-xl border border-gray-200">
        <Link
          to="/wishlist"
          className="flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
        >
          <span>My Wishlist</span>
          <span>→</span>
        </Link>

        <Link
          to="/cart"
          className="flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
        >
          <span>My Cart</span>
          <span>→</span>
        </Link>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={logout.isPending}
        className="mt-8 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />

        {logout.isPending
          ? "Signing out..."
          : "Sign Out"}
      </button>
    </main>
  );
}