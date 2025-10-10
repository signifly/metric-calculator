import { Scenario } from '@/types'
import { stringify } from 'csv-stringify/sync'

export function exportScenariosAsJSON(scenarios: Scenario[]): void {
  const dataStr = JSON.stringify(scenarios, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `scenarios-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportScenariosAsCSV(scenarios: Scenario[]): void {
  const records = scenarios.map((scenario) => ({
    Name: scenario.name,
    'Created At': new Date(scenario.createdAt).toLocaleString(),
    'CVR Change': `${scenario.adjustments.cvrChange}%`,
    'AOV Change': `${scenario.adjustments.aovChange}%`,
    'Retention Change': `${scenario.adjustments.retentionChange}%`,
    'Traffic Change': `${scenario.adjustments.trafficChange}%`,
    'Current Revenue': `$${scenario.results.current.revenue.toFixed(2)}`,
    'Projected Revenue': `$${scenario.results.projected.revenue.toFixed(2)}`,
    'Revenue Increase': `$${scenario.results.impact.revenueIncrease.toFixed(2)}`,
    'ROI': `${scenario.results.impact.percentageIncrease.toFixed(2)}%`,
    'Break-even Months': scenario.results.impact.breakEvenMonths === Infinity
      ? 'N/A'
      : scenario.results.impact.breakEvenMonths.toString()
  }))

  const csvContent = stringify(records, {
    header: true,
    columns: [
      'Name',
      'Created At',
      'CVR Change',
      'AOV Change',
      'Retention Change',
      'Traffic Change',
      'Current Revenue',
      'Projected Revenue',
      'Revenue Increase',
      'ROI',
      'Break-even Months'
    ]
  })

  const dataBlob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `scenarios-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
