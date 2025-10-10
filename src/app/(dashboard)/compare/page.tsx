'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStore } from '@/store'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import { exportScenariosAsCSV, exportScenariosAsJSON } from '@/lib/utils/export'
import { toast } from 'sonner'

export default function ComparePage() {
  const router = useRouter()
  const { scenarios, removeScenario, clearScenarios } = useStore()

  const handleExportJSON = () => {
    if (scenarios.length === 0) {
      toast.error('No scenarios to export')
      return
    }
    exportScenariosAsJSON(scenarios)
    toast.success('Scenarios exported as JSON')
  }

  const handleExportCSV = () => {
    if (scenarios.length === 0) {
      toast.error('No scenarios to export')
      return
    }
    exportScenariosAsCSV(scenarios)
    toast.success('Scenarios exported as CSV')
  }

  const handleRemove = (id: string) => {
    removeScenario(id)
    toast.success('Scenario removed')
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all scenarios?')) {
      clearScenarios()
      toast.success('All scenarios cleared')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Scenario Comparison</h1>
            <p className="text-gray-600">
              Compare saved scenarios and export results
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            {scenarios.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No scenarios saved yet</p>
              <Button onClick={() => router.push('/simulator')}>
                Create Your First Scenario
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Saved Scenarios ({scenarios.length}/10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>CVR</TableHead>
                    <TableHead>AOV</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Traffic</TableHead>
                    <TableHead>Current Rev</TableHead>
                    <TableHead>Projected Rev</TableHead>
                    <TableHead>Increase</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios.map((scenario) => (
                    <TableRow key={scenario.id}>
                      <TableCell className="font-medium">
                        {scenario.name}
                      </TableCell>
                      <TableCell>
                        {scenario.adjustments.cvrChange > 0 ? '+' : ''}
                        {scenario.adjustments.cvrChange}%
                      </TableCell>
                      <TableCell>
                        {scenario.adjustments.aovChange > 0 ? '+' : ''}
                        {scenario.adjustments.aovChange}%
                      </TableCell>
                      <TableCell>
                        {scenario.adjustments.retentionChange > 0 ? '+' : ''}
                        {scenario.adjustments.retentionChange}%
                      </TableCell>
                      <TableCell>
                        {scenario.adjustments.trafficChange > 0 ? '+' : ''}
                        {scenario.adjustments.trafficChange}%
                      </TableCell>
                      <TableCell>
                        ${scenario.results.current.revenue.toLocaleString('en-US', {
                          maximumFractionDigits: 0
                        })}
                      </TableCell>
                      <TableCell>
                        ${scenario.results.projected.revenue.toLocaleString('en-US', {
                          maximumFractionDigits: 0
                        })}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        ${scenario.results.impact.revenueIncrease.toLocaleString('en-US', {
                          maximumFractionDigits: 0
                        })}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {scenario.results.impact.percentageIncrease.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(scenario.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <Button onClick={() => router.push('/simulator')}>
          Create New Scenario
        </Button>
      </div>
    </div>
  )
}
