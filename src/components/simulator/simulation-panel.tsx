'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CalculationEngine } from '@/lib/calculations/engine'
import { useStore } from '@/store'
import { Adjustments, Metrics } from '@/types'
import { toast } from 'sonner'

export function SimulationPanel() {
  const { metrics, addScenario } = useStore()
  const [scenarioName, setScenarioName] = useState('')
  const [adjustments, setAdjustments] = useState<Adjustments>({
    cvrChange: 0,
    aovChange: 0,
    retentionChange: 0,
    trafficChange: 0,
    cacChange: 0
  })

  if (!metrics) {
    return <div>No metrics available. Please connect to a Shopify store first.</div>
  }

  // Convert LiveMetrics to Metrics format for calculation engine
  const calculationMetrics: Metrics = {
    conversionRate: metrics.conversionRate,
    averageOrderValue: metrics.orders.averageValue,
    retentionRate: metrics.customers.retentionRate,
    traffic: 10000, // Default traffic value - could be fetched from analytics
    customerAcquisitionCost: 50 // Default CAC - could be made configurable
  }

  const engine = new CalculationEngine(calculationMetrics)
  const results = engine.calculateImpact(adjustments)

  const handleSave = () => {
    const name = scenarioName || `Scenario ${new Date().toLocaleString()}`
    const scenario = {
      id: Date.now().toString(),
      name,
      adjustments,
      results,
      createdAt: new Date()
    }
    addScenario(scenario)
    toast.success(`Scenario "${name}" saved successfully!`)
    setScenarioName('')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adjust Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="flex justify-between mb-2">
                  <span>Conversion Rate Change</span>
                  <span className="font-bold">{adjustments.cvrChange}%</span>
                </Label>
                <Slider
                  value={[adjustments.cvrChange]}
                  onValueChange={([value]) =>
                    setAdjustments({ ...adjustments, cvrChange: value })
                  }
                  min={-50}
                  max={100}
                  step={5}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  Current: {calculationMetrics.conversionRate.toFixed(2)}% →
                  Projected: {results.projected.metrics.conversionRate.toFixed(2)}%
                </p>
              </div>

              <div>
                <Label className="flex justify-between mb-2">
                  <span>Average Order Value Change</span>
                  <span className="font-bold">{adjustments.aovChange}%</span>
                </Label>
                <Slider
                  value={[adjustments.aovChange]}
                  onValueChange={([value]) =>
                    setAdjustments({ ...adjustments, aovChange: value })
                  }
                  min={-50}
                  max={100}
                  step={5}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  Current: ${calculationMetrics.averageOrderValue.toFixed(2)} →
                  Projected: ${results.projected.metrics.averageOrderValue.toFixed(2)}
                </p>
              </div>

              <div>
                <Label className="flex justify-between mb-2">
                  <span>Customer Retention Change</span>
                  <span className="font-bold">{adjustments.retentionChange}%</span>
                </Label>
                <Slider
                  value={[adjustments.retentionChange]}
                  onValueChange={([value]) =>
                    setAdjustments({ ...adjustments, retentionChange: value })
                  }
                  min={-50}
                  max={100}
                  step={5}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  Current: {calculationMetrics.retentionRate.toFixed(2)}% →
                  Projected: {results.projected.metrics.retentionRate.toFixed(2)}%
                </p>
              </div>

              <div>
                <Label className="flex justify-between mb-2">
                  <span>Traffic Change</span>
                  <span className="font-bold">{adjustments.trafficChange}%</span>
                </Label>
                <Slider
                  value={[adjustments.trafficChange]}
                  onValueChange={([value]) =>
                    setAdjustments({ ...adjustments, trafficChange: value })
                  }
                  min={-50}
                  max={200}
                  step={10}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  Current: {calculationMetrics.traffic.toLocaleString()} →
                  Projected: {results.projected.metrics.traffic.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current Revenue</p>
                  <p className="text-2xl font-bold">
                    ${results.current.revenue.toLocaleString('en-US', {
                      maximumFractionDigits: 0
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Projected Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${results.projected.revenue.toLocaleString('en-US', {
                      maximumFractionDigits: 0
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Revenue Increase</p>
                <p className="text-3xl font-bold text-green-600">
                  ${results.impact.revenueIncrease.toLocaleString('en-US', {
                    maximumFractionDigits: 0
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {results.impact.percentageIncrease.toFixed(2)}% increase
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Break-even Period</p>
                <p className="text-xl font-bold">
                  {results.impact.breakEvenMonths === Infinity
                    ? 'N/A'
                    : `${results.impact.breakEvenMonths} months`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Save Scenario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scenario-name">Scenario Name (Optional)</Label>
                <Input
                  id="scenario-name"
                  placeholder="e.g., Optimistic Growth"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleSave}>
                Save Scenario
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
