import { createBrowserRouter } from "react-router-dom";

import StorefrontLayout from "../components/shared/StorefrontLayout";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../components/admin/AdminLayout";

import HomePage from "../pages/home/HomePage";
import ProductsPage from "../pages/products/ProductsPage";
import ProductDetailsPage from "../pages/products/ProductDetailsPage";
import CategoriesPage from "../pages/products/CategoriesPage";

import AccountPage from "../pages/account/AccountPage";
import LoginPage from "../pages/account/LoginPage";
import RegisterPage from "../pages/account/RegisterPage";
import WishlistPage from "../pages/account/WishlistPage";
import CartPage from "../pages/checkout/CartPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import OrderConfirmationPage from "../pages/account/OrderConfirmationPage";
import OrdersPage from "../pages/account/OrdersPage";

import AdminDashboardPage from "../pages/admin/dashboard/AdminDashboardPage";
import AdminProductsPage from "../pages/admin/products/AdminProductsPage";
import AdminEditProductPage from "../pages/admin/products/AdminEditProductPage";
import AdminInventoryPage from "../pages/admin/inventory/AdminInventoryPage";
import AdminInventoryManagePage from "../pages/admin/inventory/AdminInventoryManagePage";
import AdminCreateProductPage from "../pages/admin/products/AdminCreateProductPage";
import AdminCategoriesPage from "../pages/admin/categories/AdminCategoriesPage";
import AdminCreateCategoryPage from "../pages/admin/categories/AdminCreateCategoryPage";
import AdminEditCategoryPage from "../pages/admin/categories/AdminEditCategoryPage";





export const router = createBrowserRouter([
  {
    element: <StorefrontLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/products/:slug",
        element: <ProductDetailsPage />,
      },
      {
        path: "/categories",
        element: <CategoriesPage />,
      },
      {
        path: "/account",
        element: <AccountPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/cart",
            element: <CartPage />,
          },
          {
            path: "/wishlist",
            element: <WishlistPage />,
          },
          {
            path: "/checkout",
            element: <CheckoutPage />,
          },
          {
            path: "/account/orders",
            element: <OrdersPage />,
          },
          {
            path: "/account/orders/:id",
            element: <OrderConfirmationPage />,
          },
        ],
      },
    ],
  },

  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "/admin",
            element: <AdminDashboardPage />,
          },
          {
path: "/admin/products",
element: <AdminProductsPage />,
},
          {
path: "/admin/products/new",
element: <AdminCreateProductPage />,
},
{
  path: "/admin/products/:id/edit",
  element: <AdminEditProductPage />,
},
{
  path: "/admin/inventory",
  element: <AdminInventoryPage />,
},
{
path: "/admin/inventory/:variantId",
element: <AdminInventoryManagePage />,
},
{
path: "/admin/categories",
element: <AdminCategoriesPage />,
},
{
  path: "/admin/categories/new",
  element: <AdminCreateCategoryPage />,
},
{
  path: "/admin/categories/:id/edit",
  element: <AdminEditCategoryPage />,
},
        ],
      },
    ],
  },
]);
