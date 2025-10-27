import { create } from "zustand";
import { ShopifyStore, Scenario, LiveMetrics } from "@/types";

interface AppState {
  // Shopify connection
  currentStore: ShopifyStore | null;
  setCurrentStore: (store: ShopifyStore | null) => void;

  // Metrics
  metrics: LiveMetrics | null;
  setMetrics: (metrics: LiveMetrics | null) => void;
  lastFetchedDateRange: string | null; // Track which date range we last fetched for
  setLastFetchedDateRange: (range: string | null) => void;

  // Date Range
  dateRange: { startDate: Date; endDate: Date } | null;
  setDateRange: (range: { startDate: Date; endDate: Date } | null) => void;

  // Scenarios
  scenarios: Scenario[];
  addScenario: (scenario: Scenario) => void;
  removeScenario: (id: string) => void;
  clearScenarios: () => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  currentStore: null,
  setCurrentStore: (store) => set({ currentStore: store }),

  metrics: null,
  setMetrics: (metrics) => set({ metrics }),
  lastFetchedDateRange: null,
  setLastFetchedDateRange: (range) => set({ lastFetchedDateRange: range }),

  dateRange: null,
  setDateRange: (range) => set({ dateRange: range }),

  scenarios: [],
  addScenario: (scenario) =>
    set((state) => ({
      scenarios: [...state.scenarios, scenario].slice(-10), // Keep last 10
    })),
  removeScenario: (id) =>
    set((state) => ({
      scenarios: state.scenarios.filter((s) => s.id !== id),
    })),
  clearScenarios: () => set({ scenarios: [] }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));
