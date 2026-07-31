"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Package,
  MapPin,
  Lock,
  LogOut,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronRight,
  LayoutDashboard,
  X,
  CreditCard,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store";
import { customerApi, type CustomerAddress } from "@/features/customer/api";
import { type ApiOrder } from "@/features/admin/orders/api";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";

type Tab = "overview" | "orders" | "addresses" | "profile" | "security";

export default function MyAccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const authUser = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const openAuthDrawer = useAuthStore((state) => state.openAuthDrawer);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  // Queries for live customer data
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["customer", "profile"],
    queryFn: customerApi.getProfile,
    enabled: Boolean(authUser),
    initialData: authUser
      ? {
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          username: authUser.username ?? null,
          phone: authUser.phone ?? null,
          bio: authUser.bio ?? null,
          avatar: authUser.avatar ?? null,
          role: authUser.role,
          isVerified: authUser.isVerified ?? true,
        }
      : undefined,
  });

  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ["customer", "orders"],
    queryFn: customerApi.listOrders,
    enabled: Boolean(authUser),
  });

  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ["customer", "addresses"],
    queryFn: customerApi.listAddresses,
    enabled: Boolean(authUser),
  });

  // Calculate live stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => o.status === "COMPLETED" || o.paymentStatus === "SUCCEEDED",
  );
  const totalSpent = completedOrders.reduce(
    (sum, o) => sum + Number(o.total || 0),
    0,
  );

  // Address creation state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);

  // Profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: customerApi.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["customer", "profile"] });
      useAuthStore.setState({ user: { ...authUser, ...updatedUser } });
      toast.success("Profile details updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile details.");
    },
  });

  // Address mutation
  const createAddressMutation = useMutation({
    mutationFn: customerApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
      setShowAddressModal(false);
      toast.success("New address saved successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save address.");
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: customerApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
      toast.success("Address removed!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete address.");
    },
  });

  // Unauthenticated Fallback State
  if (authStatus !== "loading" && !authUser) {
    return (
      <StorefrontShell>
        <Breadcrumb title="My Account" />
        <section className="py-16 bg-slate-50 min-h-[500px] flex items-center justify-center">
          <div className="max-w-md w-full mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <User size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Sign In to Your Account
            </h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Log in to view your order history, manage shipping addresses, and
              update your account profile preferences.
            </p>
            <button
              type="button"
              onClick={() => openAuthDrawer("login")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#082f35] text-white font-semibold rounded-lg hover:bg-[#062429] transition shadow-md"
            >
              <User size={18} /> Log In / Register Now
            </button>
          </div>
        </section>
      </StorefrontShell>
    );
  }

  const currentUser = profile || authUser;
  const fullName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    "Customer";
  const userInitials = (
    (currentUser?.firstName?.[0] || "") + (currentUser?.lastName?.[0] || "")
  ).toUpperCase() || "CU";

  return (
    <StorefrontShell>
      <Breadcrumb title="My Account" />
      <section className="py-10 bg-slate-50 min-h-[700px]">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Customer Hero Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#082f35] text-amber-400 font-bold text-2xl md:text-3xl flex items-center justify-center shadow-md shrink-0 border-2 border-amber-400/40">
                  {currentUser?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUser.avatar}
                      alt={fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                      {fullName}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={13} /> Verified Customer
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-3 md:gap-6 w-full md:w-auto text-center">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:px-5 md:py-3">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                    Orders
                  </span>
                  <span className="text-lg md:text-xl font-bold text-slate-900">
                    {totalOrders}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:px-5 md:py-3">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                    Total Spent
                  </span>
                  <span className="text-lg md:text-xl font-bold text-emerald-700">
                    ${totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:px-5 md:py-3">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                    Addresses
                  </span>
                  <span className="text-lg md:text-xl font-bold text-slate-900">
                    {addresses.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Tabs & Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar Navigation */}
            <aside className="bg-white border border-slate-200 rounded-2xl p-3 h-fit shadow-sm">
              <nav className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    activeTab === "overview"
                      ? "bg-[#082f35] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard size={18} /> Overview
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    activeTab === "orders"
                      ? "bg-[#082f35] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Package size={18} /> My Orders
                  </span>
                  {orders.length > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        activeTab === "orders"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {orders.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("addresses")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    activeTab === "addresses"
                      ? "bg-[#082f35] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <MapPin size={18} /> Saved Addresses
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    activeTab === "profile"
                      ? "bg-[#082f35] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <User size={18} /> Account Details
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    activeTab === "security"
                      ? "bg-[#082f35] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Lock size={18} /> Password & Security
                </button>

                <div className="my-2 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    toast.success("Logged out successfully");
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              </nav>
            </aside>

            {/* Main Panel Content */}
            <main className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Welcome back, {currentUser?.firstName || "Customer"}!
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      From your customer dashboard you can manage your orders,
                      shipping addresses, and update account preferences.
                    </p>
                  </div>

                  {/* Shortcuts */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="p-5 border border-slate-200 rounded-xl text-left hover:border-[#082f35] hover:shadow-md transition group"
                    >
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-[#082f35] text-[#082f35] group-hover:text-white rounded-lg flex items-center justify-center mb-3 transition">
                        <Package size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        Recent Orders
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Track, view details, or review purchases.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("addresses")}
                      className="p-5 border border-slate-200 rounded-xl text-left hover:border-[#082f35] hover:shadow-md transition group"
                    >
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-[#082f35] text-[#082f35] group-hover:text-white rounded-lg flex items-center justify-center mb-3 transition">
                        <MapPin size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        Saved Addresses
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Manage shipping &amp; billing addresses.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className="p-5 border border-slate-200 rounded-xl text-left hover:border-[#082f35] hover:shadow-md transition group"
                    >
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-[#082f35] text-[#082f35] group-hover:text-white rounded-lg flex items-center justify-center mb-3 transition">
                        <User size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        Edit Profile
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Update name, email &amp; phone details.
                      </p>
                    </button>
                  </div>

                  {/* Recent Order Callout */}
                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900">
                        Latest Order Activity
                      </h3>
                      {orders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("orders")}
                          className="text-xs font-semibold text-[#087554] hover:underline flex items-center gap-1"
                        >
                          View all orders <ChevronRight size={14} />
                        </button>
                      )}
                    </div>

                    {isOrdersLoading ? (
                      <div className="p-8 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                        Loading recent order data...
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                        <ShoppingBag
                          size={32}
                          className="text-slate-400 mx-auto mb-2"
                        />
                        <p className="font-semibold text-slate-700 text-sm">
                          No orders placed yet
                        </p>
                        <p className="text-xs text-slate-500 mt-1 mb-4">
                          Explore our collection and place your first order.
                        </p>
                        <Link
                          href="/shop"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#082f35] text-white text-xs font-semibold rounded-lg hover:bg-[#062429] transition"
                        >
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/60">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              Order #{orders[0].orderNumber}
                            </span>
                            <OrderStatusBadge status={orders[0].status} />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Placed on{" "}
                            {new Date(orders[0].createdAt).toLocaleDateString()} ·{" "}
                            {orders[0].items?.length || 0} item(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-[#082f35] text-base">
                            ${Number(orders[0].total).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(orders[0])}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg hover:bg-slate-100 transition shadow-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MY ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      My Order History
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      View all past and present orders placed with your account.
                    </p>
                  </div>

                  {isOrdersLoading ? (
                    <div className="py-12 text-center text-slate-500">
                      <Loader2 className="animate-spin mx-auto mb-2 text-[#087554]" size={28} />
                      Fetching your orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center bg-slate-50/50">
                      <Package size={40} className="text-slate-300 mx-auto mb-3" />
                      <h3 className="font-bold text-slate-800 text-base">
                        You have no orders yet
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
                        Once you place an order, its details and status tracking
                        will be available here.
                      </p>
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#082f35] text-white text-xs font-semibold rounded-lg hover:bg-[#062429] transition shadow-sm"
                      >
                        Explore Shop
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-3.5">Order</th>
                            <th className="p-3.5">Date</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Payment</th>
                            <th className="p-3.5">Total</th>
                            <th className="p-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/60 transition">
                              <td className="p-3.5 font-bold text-slate-900">
                                #{order.orderNumber}
                              </td>
                              <td className="p-3.5 text-slate-500 whitespace-nowrap text-xs">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3.5">
                                <OrderStatusBadge status={order.status} />
                              </td>
                              <td className="p-3.5 text-xs font-medium text-slate-700">
                                {order.paymentStatus}
                              </td>
                              <td className="p-3.5 font-bold text-slate-900">
                                ${Number(order.total).toFixed(2)}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-3 py-1.5 bg-[#082f35] text-white text-xs font-semibold rounded-lg hover:bg-[#062429] transition shadow-sm"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SAVED ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Saved Shipping &amp; Billing Addresses
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Manage your delivery addresses for seamless checkout.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#082f35] text-white text-xs font-semibold rounded-lg hover:bg-[#062429] transition shadow-sm"
                    >
                      <Plus size={16} /> Add Address
                    </button>
                  </div>

                  {isAddressesLoading ? (
                    <div className="py-12 text-center text-slate-500">
                      <Loader2 className="animate-spin mx-auto mb-2 text-[#087554]" size={28} />
                      Loading addresses...
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-10 text-center bg-slate-50/50">
                      <MapPin size={36} className="text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-800 text-sm">
                        No addresses saved yet
                      </p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        Add a shipping address to speed up your future checkouts.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#082f35] text-white text-xs font-semibold rounded-lg hover:bg-[#062429] transition"
                      >
                        <Plus size={16} /> Add New Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {addr.fullName}
                              </span>
                              {addr.type && (
                                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {addr.type}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {addr.street} {addr.street2 ? `, ${addr.street2}` : ""}
                              <br />
                              {addr.city}, {addr.province || ""} {addr.postalCode || ""}
                              <br />
                              {addr.country}
                              <br />
                              Phone: {addr.phone}
                            </p>
                          </div>
                          <div className="mt-4 border-t border-slate-100 pt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => deleteAddressMutation.mutate(addr.id)}
                              disabled={deleteAddressMutation.isPending}
                              className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ACCOUNT DETAILS */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Personal Account Details
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Update your contact information and personal account details.
                    </p>
                  </div>

                  <form
                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget);
                      updateProfileMutation.mutate({
                        firstName: String(form.get("firstName")).trim(),
                        lastName: String(form.get("lastName")).trim(),
                        phone: String(form.get("phone")).trim(),
                        bio: String(form.get("bio")).trim(),
                      });
                    }}
                    className="space-y-4 max-w-lg"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          defaultValue={currentUser?.firstName || ""}
                          required
                          className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#082f35]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          defaultValue={currentUser?.lastName || ""}
                          required
                          className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#082f35]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address (Read-only)
                      </label>
                      <input
                        type="email"
                        value={currentUser?.email || ""}
                        disabled
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-100 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={currentUser?.phone || ""}
                        placeholder="+1 (555) 000-0000"
                        className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#082f35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Bio / Note
                      </label>
                      <textarea
                        name="bio"
                        rows={3}
                        defaultValue={currentUser?.bio || ""}
                        placeholder="Optional bio or account notes..."
                        className="w-full p-3 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#082f35]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="px-6 py-2.5 bg-[#082f35] text-white text-xs font-semibold rounded-lg hover:bg-[#062429] transition shadow-sm inline-flex items-center gap-2"
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="animate-spin" size={14} />
                      )}
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: SECURITY */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Password &amp; Account Security
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Keep your account safe by updating your password periodically.
                    </p>
                  </div>

                  <form
                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      toast.info(
                        "For security, password reset dispatches an OTP verification to your registered email.",
                      );
                      openAuthDrawer("forgot-password");
                    }}
                    className="space-y-4 max-w-lg border border-slate-200 rounded-xl p-5 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm">
                      <Lock size={18} className="text-[#087554]" /> Change Password
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click below to request a secure password change verification code sent directly to your registered email (<strong>{currentUser?.email}</strong>).
                    </p>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#082f35] text-white text-xs font-semibold rounded-lg hover:bg-[#062429] transition shadow-sm"
                    >
                      Request Password Change Code
                    </button>
                  </form>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                Add Shipping Address
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                createAddressMutation.mutate({
                  fullName: String(form.get("fullName")).trim(),
                  phone: String(form.get("phone")).trim(),
                  street: String(form.get("street")).trim(),
                  city: String(form.get("city")).trim(),
                  province: String(form.get("province")).trim(),
                  country: String(form.get("country")).trim(),
                  countryCode: "US",
                  postalCode: String(form.get("postalCode")).trim(),
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="123 Main St, Suite 100"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="New York"
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    placeholder="NY"
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    defaultValue="United States"
                    required
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Postal / Zip Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="10001"
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAddressMutation.isPending}
                  className="px-4 py-2 bg-[#082f35] text-white text-xs font-semibold rounded-lg hover:bg-[#062429] inline-flex items-center gap-1.5"
                >
                  {createAddressMutation.isPending && (
                    <Loader2 className="animate-spin" size={14} />
                  )}
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  Order #{selectedOrder.orderNumber}
                  <OrderStatusBadge status={selectedOrder.status} />
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Items */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Items Purchased
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between text-sm bg-white"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        ${Number(item.total).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ${Number(selectedOrder.subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">
                    ${Number(selectedOrder.shippingTotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total</span>
                  <span>${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </StorefrontShell>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
  if (status === "COMPLETED" || status === "PAID") {
    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (status === "PROCESSING") {
    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (status === "CANCELLED") {
    badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}
    >
      {status}
    </span>
  );
}
