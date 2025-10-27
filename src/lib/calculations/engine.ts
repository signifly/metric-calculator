import { Metrics, Adjustments, CalculationResults } from "@/types";

export class CalculationEngine {
  private metrics: Metrics;

  constructor(metrics: Metrics) {
    this.metrics = metrics;
  }

  calculateImpact(adjustments: Adjustments): CalculationResults {
    const currentRevenue = this.calculateRevenue(this.metrics);

    const adjustedMetrics: Metrics = {
      conversionRate:
        this.metrics.conversionRate * (1 + adjustments.cvrChange / 100),
      averageOrderValue:
        this.metrics.averageOrderValue * (1 + adjustments.aovChange / 100),
      retentionRate:
        this.metrics.retentionRate * (1 + adjustments.retentionChange / 100),
      traffic: this.metrics.traffic * (1 + adjustments.trafficChange / 100),
      customerAcquisitionCost:
        this.metrics.customerAcquisitionCost + adjustments.cacChange,
    };

    const projectedRevenue = this.calculateRevenue(adjustedMetrics);
    const revenueIncrease = projectedRevenue - currentRevenue;
    const roi =
      currentRevenue > 0 ? (revenueIncrease / currentRevenue) * 100 : 0;

    return {
      current: {
        revenue: currentRevenue,
        metrics: this.metrics,
      },
      projected: {
        revenue: projectedRevenue,
        metrics: adjustedMetrics,
      },
      impact: {
        revenueIncrease,
        percentageIncrease: roi,
        breakEvenMonths: this.calculateBreakEven(adjustments, revenueIncrease),
      },
    };
  }

  private calculateRevenue(metrics: Metrics): number {
    const customers = metrics.traffic * (metrics.conversionRate / 100);
    const firstTimeRevenue = customers * metrics.averageOrderValue;
    const repeatRevenue =
      customers * (metrics.retentionRate / 100) * metrics.averageOrderValue;
    return firstTimeRevenue + repeatRevenue;
  }

  private calculateBreakEven(
    adjustments: Adjustments,
    monthlyIncrease: number
  ): number {
    // Simplified break-even calculation
    const implementationCost = 10000; // Example fixed cost
    return monthlyIncrease > 0
      ? Math.ceil(implementationCost / monthlyIncrease)
      : Infinity;
  }

  compareScenarios(scenarios: Adjustments[]) {
    return scenarios.map((adjustment, index) => ({
      id: `scenario-${index}`,
      adjustments: adjustment,
      results: this.calculateImpact(adjustment),
    }));
  }
}
