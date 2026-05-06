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
      <div className="bg-creme min-h-screen pt-40 pb-20 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-alpha/5 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-alpha animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-creme min-h-screen pt-40 pb-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-alpha/5 rounded-full blur-[100px]" />
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-secondary text-alpha leading-tight tracking-tight mb-3">
            My Orders
          </h1>
          <p className="text-[13px] font-medium text-alpha/60 leading-relaxed">
            Track and manage your furniture orders
          </p>
        </div>

        {/* Orders List */}
        {fetchError ? (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-12 text-center shadow-sm border border-alpha/5">
            <div className="w-24 h-24 bg-red-50/80 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-secondary text-alpha mb-3">
              Couldn't load orders
            </h2>
            <p className="text-[13px] font-medium text-alpha/60 mb-8">
              Something went wrong. Please try again.
            </p>
            <button
              onClick={fetchOrders}
              className="bg-alpha text-white px-8 py-3.5 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-tango shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-12 text-center shadow-sm border border-alpha/5">
            <div className="w-24 h-24 bg-alpha/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-alpha/30" />
            </div>
            <h2 className="text-2xl font-secondary text-alpha mb-3">
              No orders yet
            </h2>
            <p className="text-[13px] font-medium text-alpha/60 mb-8">
              Start shopping to place your first order
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-alpha text-white px-10 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-tango shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                  className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-sm border border-alpha/5 overflow-hidden transition-all duration-300 hover:shadow-md"
                >
                  {/* Order Header */}
                  <div className="px-6 sm:px-8 py-6 border-b border-alpha/5 bg-alpha/5 flex flex-wrap items-center justify-between gap-5">
                    <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                      <div>
                        <p className="text-[10px] font-bold text-alpha/50 uppercase tracking-widest mb-1.5">
                          Order Number
                        </p>
                        <p className="text-[13px] font-bold text-alpha">
                          {order.order_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-alpha/50 uppercase tracking-widest mb-1.5">
                          Date
                        </p>
                        <p className="text-[13px] font-bold text-alpha">
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
                        <p className="text-[10px] font-bold text-alpha/50 uppercase tracking-widest mb-1.5">
                          Total
                        </p>
                        <p className="text-[13px] font-bold text-alpha">
                          {hasPrice
                            ? `₹${total.toLocaleString("en-IN")}`
                            : "Quotation Pending"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest ${getStageColor(order.stage).replace('bg-', 'bg-opacity-20 bg-')}`}
                        style={{ backgroundColor: order.stage === 'delivered' ? 'rgba(34, 197, 94, 0.1)' : order.stage === 'shipped' ? 'rgba(168, 85, 247, 0.1)' : order.stage === 'processing' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}
                      >
                        {order.stage_display}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 sm:p-8">
                    <div className="space-y-5">
                      {order.items.map((item) => {
                        const itemImage =
                          item.product_snapshot?.images?.[0]?.url ||
                          "/placeholder-product.svg";
                        const itemName =
                          item.product_snapshot?.name || item.product.name;

                        return (
                          <div
                            key={item.id}
                            className="flex gap-5 items-center group"
                          >
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-alpha/5 overflow-hidden flex-shrink-0">
                              <Image
                                src={itemImage}
                                alt={itemName}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-secondary text-alpha truncate mb-1">
                                {itemName}
                              </h3>
                              <p className="inline-block text-[11px] font-medium text-alpha/60 bg-alpha/5 px-3 py-1 rounded-lg">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="hidden sm:block text-right">
                                <p className="text-[13px] font-bold text-alpha">
                                  ₹{parseFloat(item.total).toLocaleString("en-IN")}
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
                      className="mt-8 w-full flex items-center justify-between px-6 py-4 bg-white border border-alpha/5 rounded-2xl text-[12px] font-bold uppercase tracking-widest text-alpha hover:border-alpha/20 hover:shadow-sm transition-all duration-300 group hover:bg-alpha/5"
                    >
                      <span>View Order Details</span>
                      <ChevronRight className="w-4 h-4 text-alpha/40 group-hover:text-alpha group-hover:translate-x-1 transition-all" />
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
