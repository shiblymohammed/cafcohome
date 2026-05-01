"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { ApiClient } from "@/src/lib/api/client";
import {
  Package,
  MapPin,
  Phone,
  ChevronLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
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
    dimensions?: any;
  };
  quantity: number;
  unit_price: string;
  discount: string;
  total: string;
}

interface OrderTracking {
  id: number;
  stage: string;
  stage_display: string;
  updated_by_name: string | null;
  notes: string;
  timestamp: string;
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
  tracking_history: OrderTracking[];
  created_at: string;
  updated_at: string;
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?redirect=/orders/${orderNumber}`);
    } else if (status === "authenticated" && session?.accessToken && orderNumber) {
      fetchOrder();
    }
  }, [status, session, orderNumber, router]);

  const fetchOrder = async () => {
    if (!session?.accessToken || !orderNumber) return;

    try {
      setLoading(true);
      const response = await ApiClient.getOrderById(
        orderNumber,
        session.accessToken
      );
      setOrder(response);
    } catch (error) {
      console.error("Failed to fetch order:", error);
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

  const stages = [
    { key: "order_received", label: "Order Received" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const getCurrentStageIndex = (stage: string) => {
    return stages.findIndex((s) => s.key === stage);
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

  if (!order) {
    return (
      <div className="bg-creme min-h-screen pt-24 md:pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-alpha/30 mx-auto mb-4" />
            <h2 className="text-xl font-secondary text-alpha mb-2">
              Order not found
            </h2>
            <button
              onClick={() => router.push("/orders")}
              className="mt-4 text-sm text-alpha hover:underline"
            >
              ← Back to orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = parseFloat(order.total);
  const hasPrice = total > 0;
  const currentStageIndex = getCurrentStageIndex(order.stage);

  return (
    <div className="bg-creme min-h-screen pt-24 md:pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 text-sm text-alpha/60 hover:text-alpha mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to orders
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-secondary text-alpha mb-1">
                Order {order.order_number}
              </h1>
              <p className="text-sm text-alpha/60">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`inline-block px-4 py-2 text-xs font-medium uppercase tracking-wider ${getStageColor(order.stage)}`}
            >
              {order.stage_display}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="bg-white border border-alpha/10 p-6">
            <div className="flex items-center justify-between">
              {stages.map((stage, index) => (
                <div key={stage.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index <= currentStageIndex
                          ? "bg-alpha text-creme"
                          : "bg-alpha/10 text-alpha/30"
                      }`}
                    >
                      {index < currentStageIndex ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-2 text-center ${
                        index <= currentStageIndex
                          ? "text-alpha font-medium"
                          : "text-alpha/40"
                      }`}
                    >
                      {stage.label}
                    </p>
                  </div>
                  {index < stages.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < currentStageIndex ? "bg-alpha" : "bg-alpha/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white border border-alpha/10">
              <div className="px-6 py-4 border-b border-alpha/10">
                <h2 className="text-sm font-primary uppercase tracking-widest text-alpha">
                  Order Items ({order.items.length})
                </h2>
              </div>
              <div className="divide-y divide-alpha/10">
                {order.items.map((item) => {
                  const itemImage =
                    item.product_snapshot?.images?.[0]?.url ||
                    "/placeholder-product.svg";
                  const itemName =
                    item.product_snapshot?.name || item.product.name;
                  const itemPrice = parseFloat(item.unit_price);

                  return (
                    <div key={item.id} className="p-6 flex gap-4">
                      <div className="relative w-24 h-24 bg-sand flex-shrink-0">
                        <Image
                          src={itemImage}
                          alt={itemName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-primary text-alpha mb-1">
                          {itemName}
                        </h3>
                        <p className="text-xs text-alpha/60">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order History */}
            {order.tracking_history && order.tracking_history.length > 0 && (
              <div className="bg-white border border-alpha/10">
                <div className="px-6 py-4 border-b border-alpha/10">
                  <h2 className="text-sm font-primary uppercase tracking-widest text-alpha">
                    Order History
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order.tracking_history.map((tracking, index) => (
                      <div key={tracking.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-alpha" />
                          {index < order.tracking_history.length - 1 && (
                            <div className="w-0.5 flex-1 bg-alpha/20 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium text-alpha">
                            {tracking.stage_display}
                          </p>
                          {tracking.notes && (
                            <p className="text-xs text-alpha/60 mt-1">
                              {tracking.notes}
                            </p>
                          )}
                          <p className="text-xs text-alpha/40 mt-1">
                            {new Date(tracking.timestamp).toLocaleString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-alpha/10">
              <div className="px-6 py-4 border-b border-alpha/10">
                <h2 className="text-sm font-primary uppercase tracking-widest text-alpha">
                  Order Summary
                </h2>
              </div>
              <div className="p-6">
                {hasPrice ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-alpha/70">Subtotal</span>
                      <span className="text-alpha">
                        ₹{parseFloat(order.subtotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {parseFloat(order.discount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-alpha/70">Discount</span>
                        <span className="text-green-600">
                          -₹{parseFloat(order.discount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="h-px bg-alpha/10" />
                    <div className="flex justify-between text-base font-medium">
                      <span className="text-alpha">Total</span>
                      <span className="text-alpha">
                        ₹{total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-alpha/60">
                      Quotation Pending
                    </p>
                    <p className="text-xs text-alpha/40 mt-2">
                      We will contact you shortly with pricing details
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white border border-alpha/10">
              <div className="px-6 py-4 border-b border-alpha/10 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-alpha" />
                <h2 className="text-sm font-primary uppercase tracking-widest text-alpha">
                  Delivery Address
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-alpha/80 leading-relaxed whitespace-pre-line">
                  {order.delivery_address}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-alpha/10">
              <div className="px-6 py-4 border-b border-alpha/10 flex items-center gap-2">
                <Phone className="w-4 h-4 text-alpha" />
                <h2 className="text-sm font-primary uppercase tracking-widest text-alpha">
                  Contact Number
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-alpha">{order.phone_number}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
