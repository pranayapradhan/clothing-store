import { useState } from "react";
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import PageContainer from "./PageContainer";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/products" },
  { name: "Categories", href: "/categories" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const handleSearch = (event: Parameters<
    NonNullable<React.ComponentProps<"form">["onSubmit"]>
  >[0]) => {
    event.preventDefault();

    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      navigate("/products");
      setIsSearchOpen(false);
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(trimmedSearch)}`
    );

    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <PageContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-md p-2 hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold tracking-tight"
          >
            CLOTHING
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-black"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              type="button"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="rounded-md p-2 hover:bg-gray-100"
              aria-label="Search"
              aria-expanded={isSearchOpen}
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>

            {/* Account */}
            <Link
              to="/account"
              className="hidden rounded-md p-2 hover:bg-gray-100 sm:block"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="rounded-md p-2 hover:bg-gray-100"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <form
            onSubmit={handleSearch}
            className="border-t py-3"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search clothing..."
                autoFocus
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
              />
            </div>
          </form>
        )}

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium hover:bg-gray-100"
                >
                  {item.name}
                </Link>
              ))}

              <Link
                to="/account"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium hover:bg-gray-100"
              >
                Account
              </Link>
            </div>
          </nav>
        )}
      </PageContainer>
    </header>
  );
}