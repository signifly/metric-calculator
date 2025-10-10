export interface Metrics {
  conversionRate: number
  averageOrderValue: number
  retentionRate: number
  traffic: number
  customerAcquisitionCost: number
}

export interface Adjustments {
  cvrChange: number // percentage
  aovChange: number // percentage
  retentionChange: number // percentage
  trafficChange: number // percentage
  cacChange: number // absolute
}

export interface CalculationResults {
  current: {
    revenue: number
    metrics: Metrics
  }
  projected: {
    revenue: number
    metrics: Metrics
  }
  impact: {
    revenueIncrease: number
    percentageIncrease: number
    breakEvenMonths: number
  }
}

export interface Scenario {
  id: string
  name: string
  adjustments: Adjustments
  results: CalculationResults
  createdAt: Date
}

export interface ShopifyStore {
  domain: string
  name: string
  token: string
}

export interface LiveMetrics {
  orders: {
    count: number
    totalRevenue: number
    averageValue: number
  }
  customers: {
    total: number
    returning: number
    new: number
    retentionRate: number
  }
  conversionRate: number
  lastUpdated: Date
}
