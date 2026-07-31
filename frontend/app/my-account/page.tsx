"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store";
import { customerApi } from "@/features/customer/api";
import { type ApiOrder } from "@/features/admin/orders/api";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";

type Tab = "dashboard" | "orders" | "addresses" | "account-details";

export default function MyAccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const authUser = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const openAuthDrawer = useAuthStore((state) => state.openAuthDrawer);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Queries for live customer data
  const { data: profile } = useQuery({
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
          phone: (authUser as { phone?: string | null }).phone ?? null,
          bio: (authUser as { bio?: string | null }).bio ?? null,
          avatar: (authUser as { avatar?: string | null }).avatar ?? null,
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

  // Profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: customerApi.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["customer", "profile"] });
      if (authUser) {
        useAuthStore.setState({
          user: {
            ...authUser,
            ...updatedUser,
          },
        });
      }
      toast.success("Account details saved successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save account details.");
    },
  });

  // Address mutations
  const createAddressMutation = useMutation({
    mutationFn: customerApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
      setShowAddressModal(false);
      toast.success("Address added successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add address.");
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: customerApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
      toast.success("Address removed.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove address.");
    },
  });

  // Unauthenticated Fallback State
  if (authStatus !== "loading" && !authUser) {
    return (
      <StorefrontShell>
        <Breadcrumb title="My Account" />
        <section className="py-12 sm:py-16 bg-white min-h-[450px] flex items-center justify-center pb-28 md:pb-16">
          <div className="max-w-md w-full mx-auto px-4 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              My Account
            </h2>
            <p className="text-slate-600 mb-6 text-sm">
              Please sign in to view your orders, address book, and account settings.
            </p>
            <button
              type="button"
              onClick={() => openAuthDrawer("login")}
              className="px-6 py-2.5 bg-[#082f35] text-white font-semibold text-sm rounded hover:bg-[#062429] transition"
            >
              Sign In / Register
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

  return (
    <StorefrontShell>
      <Breadcrumb title="My Account" />
      <section className="py-6 sm:py-12 bg-white min-h-[600px] pb-28 md:pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-8">
            {/* Mobile Horizontal Pill Scroll Navigation / Desktop Vertical Menu */}
            <aside>
              {/* Mobile Horizontal Pill Scroll */}
              <div className="flex md:hidden overflow-x-auto gap-2 border-b border-slate-200 pb-3 bg-white no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition shrink-0 ${
                    activeTab === "dashboard"
                      ? "bg-[#082f35] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition shrink-0 ${
                    activeTab === "orders"
                      ? "bg-[#082f35] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Orders {orders.length > 0 && `(${orders.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("addresses")}
                  className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition shrink-0 ${
                    activeTab === "addresses"
                      ? "bg-[#082f35] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Addresses
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("account-details")}
                  className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition shrink-0 ${
                    activeTab === "account-details"
                      ? "bg-[#082f35] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Account Details
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    toast.success("Logged out successfully.");
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap text-red-600 bg-red-50 hover:bg-red-100 transition shrink-0"
                >
                  Logout
                </button>
              </div>

              {/* Desktop Classic Vertical Menu List */}
              <ul className="hidden md:flex flex-col border border-slate-200 rounded divide-y divide-slate-100 text-sm font-medium text-slate-700 bg-white">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full text-left px-4 py-3 transition ${
                      activeTab === "dashboard"
                        ? "bg-[#082f35] text-white font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className={`w-full text-left px-4 py-3 transition ${
                      activeTab === "orders"
                        ? "bg-[#082f35] text-white font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    Orders {orders.length > 0 && `(${orders.length})`}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab("addresses")}
                    className={`w-full text-left px-4 py-3 transition ${
                      activeTab === "addresses"
                        ? "bg-[#082f35] text-white font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    Addresses
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab("account-details")}
                    className={`w-full text-left px-4 py-3 transition ${
                      activeTab === "account-details"
                        ? "bg-[#082f35] text-white font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    Account Details
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      toast.success("Logged out successfully.");
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </aside>

            {/* Main Content Area */}
            <main className="text-slate-800 text-sm">
              {/* TAB 1: DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base">
                    Hello <strong>{fullName}</strong> (not <strong>{fullName}</strong>?{" "}
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        toast.success("Logged out.");
                      }}
                      className="text-[#087554] underline font-semibold hover:text-[#082f35]"
                    >
                      Log out
                    </button>
                    )
                  </p>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                    From your account dashboard you can easily view your{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="text-[#087554] font-semibold hover:underline"
                    >
                      recent orders
                    </button>
                    , manage your{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("addresses")}
                      className="text-[#087554] font-semibold hover:underline"
                    >
                      shipping and billing addresses
                    </button>
                    , and{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("account-details")}
                      className="text-[#087554] font-semibold hover:underline"
                    >
                      edit your account details
                    </button>
                    .
                  </p>
                </div>
              )}

              {/* TAB 2: ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                    Orders
                  </h2>

                  {isOrdersLoading ? (
                    <div className="py-8 text-center text-slate-500">
                      <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                      Loading orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="border border-slate-200 rounded p-6 text-center text-slate-600 bg-slate-50/50">
                      <p className="mb-3 text-xs sm:text-sm">No orders have been placed yet.</p>
                      <Link
                        href="/shop"
                        className="inline-block px-4 py-2 bg-[#082f35] text-white text-xs font-semibold rounded hover:bg-[#062429]"
                      >
                        Go Shop
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto border border-slate-200 rounded">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase border-b border-slate-200">
                            <tr>
                              <th className="p-3">Order</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Total</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {orders.map((order) => (
                              <tr key={order.id} className="hover:bg-slate-50">
                                <td className="p-3 font-semibold text-slate-900">
                                  #{order.orderNumber}
                                </td>
                                <td className="p-3 text-slate-600 text-xs">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 border text-slate-700">
                                    {order.status}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-slate-900">
                                  ${Number(order.total).toFixed(2)}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrder(order)}
                                    className="px-3 py-1 bg-[#082f35] text-white text-xs font-semibold rounded hover:bg-[#062429]"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Responsive Cards */}
                      <div className="grid grid-cols-1 gap-3 md:hidden">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-sm">
                                #{order.orderNumber}
                              </span>
                              <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 border text-slate-700 uppercase">
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                              <span className="font-bold text-slate-900 text-sm">
                                ${Number(order.total).toFixed(2)}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="w-full py-1.5 bg-[#082f35] text-white text-xs font-semibold rounded text-center"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Addresses
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="px-3 py-1.5 bg-[#082f35] text-white text-xs font-semibold rounded hover:bg-[#062429] inline-flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Address
                    </button>
                  </div>

                  <p className="text-slate-600 text-xs">
                    The following addresses will be used on the checkout page by default.
                  </p>

                  {isAddressesLoading ? (
                    <div className="py-8 text-center text-slate-500">
                      <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                      Loading addresses...
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="border border-slate-200 rounded p-6 text-center text-slate-600 bg-slate-50/50">
                      <p className="mb-3 text-xs sm:text-sm">You have not saved any addresses yet.</p>
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(true)}
                        className="px-4 py-2 bg-[#082f35] text-white text-xs font-semibold rounded hover:bg-[#062429]"
                      >
                        Add Address Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="border border-slate-200 rounded p-4 bg-white flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-slate-900">{addr.fullName}</strong>
                              {addr.type && (
                                <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded">
                                  {addr.type}
                                </span>
                              )}
                            </div>
                            <address className="not-italic text-xs text-slate-600 leading-relaxed">
                              {addr.street} {addr.street2 ? `, ${addr.street2}` : ""}
                              <br />
                              {addr.city}, {addr.province || ""} {addr.postalCode || ""}
                              <br />
                              {addr.country}
                              <br />
                              Phone: {addr.phone}
                            </address>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              type="button"
                              onClick={() => deleteAddressMutation.mutate(addr.id)}
                              disabled={deleteAddressMutation.isPending}
                              className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ACCOUNT DETAILS */}
              {activeTab === "account-details" && (
                <div className="space-y-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                    Account details
                  </h2>

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
                    className="space-y-4 max-w-md"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          defaultValue={currentUser?.firstName || ""}
                          required
                          className="w-full h-10 sm:h-9 px-3 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-[#082f35]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          defaultValue={currentUser?.lastName || ""}
                          required
                          className="w-full h-10 sm:h-9 px-3 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-[#082f35]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={currentUser?.email || ""}
                        disabled
                        className="w-full h-10 sm:h-9 px-3 border border-slate-200 bg-slate-100 rounded text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={currentUser?.phone || ""}
                        placeholder="e.g. +1 555 123 4567"
                        className="w-full h-10 sm:h-9 px-3 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-[#082f35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bio / Note
                      </label>
                      <textarea
                        name="bio"
                        rows={3}
                        defaultValue={currentUser?.bio || ""}
                        className="w-full p-2.5 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-[#082f35]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#D4AF4A] hover:bg-[#c39e39] text-white font-semibold text-xs rounded transition inline-flex items-center justify-center gap-2"
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="animate-spin" size={14} />
                      )}
                      Save changes
                    </button>
                  </form>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Add Address Side Drawer */}
      {showAddressModal && (
        <>
          <div
            className="fixed inset-0 z-[1100] bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAddressModal(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed top-0 bottom-0 right-0 z-[1101] w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
            aria-label="Add New Address"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Add New Address
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Save a shipping or billing address to your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm"
                aria-label="Close drawer"
              >
                <X size={18} />
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
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs pb-28"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full h-10 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#082f35]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. +1 555 019 2834"
                  className="w-full h-10 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#082f35]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="House number & street name"
                  className="w-full h-10 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#082f35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="New York"
                    className="w-full h-10 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#082f35]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    placeholder="NY"
                    className="w-full h-10 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#082f35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    defaultValue="United States"
                    required
                    className="w-full h-10 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#082f35]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="10001"
                    className="w-full h-10 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#082f35]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAddressMutation.isPending}
                  className="px-5 py-2 bg-[#082f35] text-white text-xs font-semibold rounded hover:bg-[#062429] inline-flex items-center gap-1.5 shadow"
                >
                  {createAddressMutation.isPending && (
                    <Loader2 className="animate-spin" size={14} />
                  )}
                  Save Address
                </button>
              </div>
            </form>
          </aside>
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-4 sm:p-5 shadow-xl space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Order #{selectedOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="divide-y divide-slate-100 border border-slate-200 rounded">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-2.5 flex justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.productName}</p>
                      <p className="text-slate-500 text-[11px]">
                        ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      ${Number(item.total).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-3 rounded space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${Number(selectedOrder.shippingTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>Total</span>
                  <span>${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded"
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
