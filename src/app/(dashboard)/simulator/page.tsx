'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SimulationPanel } from '@/components/simulator/simulation-panel'
import { ArrowLeft } from 'lucide-react'

export default function SimulatorPage() {
  const router = useRouter()

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
        <h1 className="text-3xl font-bold mb-2">Revenue Impact Simulator</h1>
        <p className="text-gray-600">
          Adjust metrics to see the potential revenue impact
        </p>
      </div>

      <SimulationPanel />

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push('/compare')}>
          View Saved Scenarios
        </Button>
      </div>
    </div>
  )
}
