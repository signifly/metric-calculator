"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { useShopifyMetrics } from "@/hooks/use-shopify-metrics";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { currentStore, metrics, isLoading, error, setDateRange, dateRange } =
    useStore();

  // Initialize date range on first mount only
  useEffect(() => {
    if (!dateRange) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setDateRange({ startDate: start, endDate: end });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Memoize the callback to prevent recreating it
  const handleDateRangeChange = useCallback(
    (range: { startDate: Date; endDate: Date }) => {
      setDateRange(range);
    },
    [setDateRange]
  );

  // Fetch metrics on mount
  useShopifyMetrics();

  // Only show loading if we don't have metrics yet and we're loading
  if (isLoading && !metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Shopify metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Metrics</AlertTitle>
          <AlertDescription>
            {error}
            <br />
            <br />
            Make sure you have configured SHOPIFY_STORE_DOMAIN and
            SHOPIFY_ADMIN_API_TOKEN in your .env.local file.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentStore || !metrics) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTitle>No Store Connected</AlertTitle>
          <AlertDescription>
            Please configure your Shopify store credentials in .env.local
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-start md:flex-row flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {currentStore.name} Dashboard
          </h1>
          <p className="text-gray-600">
            View your store metrics and run simulations
          </p>
        </div>
        <DateRangePicker
          onDateRangeChange={handleDateRangeChange}
          currentDateRange={dateRange || undefined}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricsCard
          title="Conversion Rate"
          value={metrics?.conversionRate || 0}
          format="percentage"
        />
        <MetricsCard
          title="Average Order Value"
          value={metrics?.orders?.averageValue || 0}
          format="currency"
        />
        <MetricsCard
          title="Customer Retention"
          value={metrics?.customers?.retentionRate || 0}
          format="percentage"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <MetricsCard
          title="Total Orders"
          value={metrics?.orders?.count || 0}
          format="number"
        />
        <MetricsCard
          title="Total Revenue"
          value={metrics?.orders?.totalRevenue || 0}
          format="currency"
        />
      </div>

      <div className="flex gap-4">
        <Button onClick={() => router.push("/simulator")}>
          Run Simulation
        </Button>
        <Button variant="outline" onClick={() => router.push("/compare")}>
          Compare Scenarios
        </Button>
      </div>
    </div>
  );
}
