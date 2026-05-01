"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/src/lib/api/client";
import { Package, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
  };
  product_snapshot: {
    name: string;
    images: Array<{ url: string; alt?: string }>;
  };
  quantity: number;
  unit_price: string;
  discount: string;
  total: string;
}

interface Order {
  id: number;
  order_number: string;
  delivery_address: string;
  phone_number: string;
  stage: string;
  stage_display: string;
  subtotal: string;
  discount: string;
  total: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/orders");
    } else if (status === "authenticated" && session?.accessToken) {
      fetchOrders();
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setFetchError(false);
      const response = await ApiClient.getOrders(session.accessToken);
      setOrders(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setFetchError(true);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      order_received: "bg-blue-100 text-blue-800",
      processing: "bg-yellow-100 text-yellow-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  if (status === "loading" || loading) {
    return (
      <div className="bg-creme min-h-screen pt-24 md:pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-alpha animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-creme min-h-screen pt-24 md:pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-secondary text-alpha mb-2">
            My Orders
          </h1>
          <p className="text-sm text-alpha/60">
            Track and manage your furniture orders
          </p>
        </div>

        {/* Orders List */}
        {fetchError ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-red-300" />
            </div>
            <h2 className="text-xl font-secondary text-alpha mb-2">
              Couldn&apos;t load orders
            </h2>
            <p className="text-sm text-alpha/60 mb-8">
              Something went wrong. Please try again.
            </p>
            <button
              onClick={fetchOrders}
              className="bg-alpha text-creme px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-alpha/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-alpha/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-alpha/30" />
            </div>
            <h2 className="text-xl font-secondary text-alpha mb-2">
              No orders yet
            </h2>
            <p className="text-sm text-alpha/60 mb-8">
              Start shopping to place your first order
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-alpha text-creme px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-alpha/90 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const total = parseFloat(order.total);
              const hasPrice = total > 0;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-alpha/10 hover:border-alpha/20 transition-colors"
                >
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-alpha/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-xs text-alpha/50 uppercase tracking-wider mb-1">
                          Order Number
                        </p>
                        <p className="text-sm font-primary text-alpha font-medium">
                          {order.order_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-alpha/50 uppercase tracking-wider mb-1">
                          Date
                        </p>
                        <p className="text-sm text-alpha">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-alpha/50 uppercase tracking-wider mb-1">
                          Total
                        </p>
                        <p className="text-sm text-alpha font-medium">
                          {hasPrice
                            ? `₹${total.toLocaleString("en-IN")}`
                            : "Quotation Pending"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider ${getStageColor(order.stage)}`}
                      >
                        {order.stage_display}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => {
                        const itemImage =
                          item.product_snapshot?.images?.[0]?.url ||
                          "/placeholder-product.svg";
                        const itemName =
                          item.product_snapshot?.name || item.product.name;

                        return (
                          <div
                            key={item.id}
                            className="flex gap-4 items-start"
                          >
                            <div className="relative w-20 h-20 bg-sand flex-shrink-0">
                              <Image
                                src={itemImage}
                                alt={itemName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-primary text-alpha truncate">
                                {itemName}
                              </h3>
                              <p className="text-xs text-alpha/60 mt-1">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() =>
                        router.push(`/orders/${order.order_number}`)
                      }
                      className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 border border-alpha/20 text-xs uppercase tracking-widest text-alpha hover:border-alpha hover:bg-alpha/5 transition-colors"
                    >
                      View Order Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
