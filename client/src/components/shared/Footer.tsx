import { Link } from "react-router-dom";

import PageContainer from "./PageContainer";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <PageContainer>
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-lg font-bold">CLOTHING</h2>
            <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600">
              Quality clothing designed for everyday style and comfort.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Shop</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
              <Link to="/products" className="hover:text-black">
                All Products
              </Link>

              <Link to="/categories" className="hover:text-black">
                Categories
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Account</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
              <Link to="/account" className="hover:text-black">
                My Account
              </Link>

              <Link to="/orders" className="hover:text-black">
                My Orders
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Support</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
              <Link to="/contact" className="hover:text-black">
                Contact Us
              </Link>

              <Link to="/chat" className="hover:text-black">
                Customer Support
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Clothing Store. All rights reserved.
        </div>
      </PageContainer>
    </footer>
  );
}