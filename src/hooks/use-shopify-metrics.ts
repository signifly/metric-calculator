import { useEffect } from "react";
import { useStore } from "@/store";
import { toast } from "sonner";

export function useShopifyMetrics() {
  const {
    dateRange,
    setMetrics,
    setCurrentStore,
    setIsLoading,
    setError,
    lastFetchedDateRange,
    setLastFetchedDateRange,
  } = useStore();

  useEffect(() => {
    // Don't fetch if dateRange is not set
    if (!dateRange) {
      return;
    }

    // Create a stable key from the date range
    const dateRangeKey = `${dateRange.startDate.toISOString()}_${dateRange.endDate.toISOString()}`;

    // Skip if this is the same date range we just fetched for
    if (dateRangeKey === lastFetchedDateRange) {
      return;
    }

    // Update the last fetched date range
    setLastFetchedDateRange(dateRangeKey);

    let isMounted = true;

    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query params for date range
        const params = new URLSearchParams({
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        });
        const url = `/api/shopify/metrics?${params.toString()}`;

        const response = await fetch(url);

        if (!isMounted) return;

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch metrics");
        }

        // Set store info
        setCurrentStore({
          domain: data.shop,
          name: data.shop.replace(".myshopify.com", ""),
          token: "configured", // Not exposing actual token
        });

        // Set metrics
        setMetrics(data.metrics);
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error ? error.message : "Failed to load metrics";
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMetrics();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);
}
