'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-[500px]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            Metrics Impact Simulator
          </CardTitle>
          <CardDescription className="text-base">
            Simulate and demonstrate revenue impact of ecommerce optimizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Connect Shopify Store</h3>
                <p className="text-sm text-gray-600">
                  Link your Shopify store to fetch real-time metrics
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Run Simulations</h3>
                <p className="text-sm text-gray-600">
                  Adjust CVR, AOV, retention, and traffic to see impact
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Compare & Export</h3>
                <p className="text-sm text-gray-600">
                  Save scenarios and export results as CSV or JSON
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push('/signin')}
          >
            Get Started
          </Button>

          <p className="text-xs text-center text-gray-500">
            Only @signifly.com emails are allowed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
