# Implementation Guide - No Database Version

## Quick Start

This guide will help you set up the Metrics Impact Simulator without any database dependencies.

## Step 1: Create Next.js Project

```bash
# Create new project
npx create-next-app@latest metrics-calculator

# Choose these options:
✔ Would you like to use TypeScript? → Yes
✔ Would you like to use ESLint? → Yes
✔ Would you like to use Tailwind CSS? → Yes
✔ Would you like to use `src/` directory? → No
✔ Would you like to use App Router? → Yes
✔ Would you like to customize the default import alias? → No

# Navigate to project
cd metrics-calculator
```

## Step 2: Install Dependencies

```bash
# Core dependencies
npm install next-auth@4 @shopify/shopify-api graphql-request
npm install zustand react-hook-form zod @hookform/resolvers
npm install recharts date-fns csv-stringify js-cookie

# Types
npm install --save-dev @types/js-cookie

# shadcn/ui setup
npx shadcn@latest init
npx shadcn@latest add button card form input label
npx shadcn@latest add select slider table tabs
npx shadcn@latest add dialog sheet toast alert
```

## Step 3: Project Structure

Create the following folder structure:

```bash
# Create directories
mkdir -p app/api/auth
mkdir -p app/api/shopify
mkdir -p app/api/export
mkdir -p app/\(auth\)/signin
mkdir -p app/\(dashboard\)/{dashboard,simulator,compare}
mkdir -p components/{dashboard,simulator,comparison,shared}
mkdir -p lib/{shopify,calculations,storage,utils}
mkdir -p hooks
mkdir -p store
mkdir -p types
```

## Step 4: Environment Configuration

Create `.env.local`:

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-32-chars-minimum

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Shopify
SHOPIFY_APP_API_KEY=your-shopify-api-key
SHOPIFY_APP_API_SECRET=your-shopify-api-secret
SHOPIFY_APP_SCOPES=read_orders,read_customers,read_products
SHOPIFY_APP_REDIRECT_URI=http://localhost:3000/api/shopify/callback

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SESSION_TIMEOUT=28800000
```

## Step 5: Core Implementation Files

### 5.1 Authentication Setup

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          hd: "signifly.com"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ profile }) {
      return profile?.email?.endsWith("@signifly.com") || false
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      return session
    }
  },
  pages: {
    signIn: "/signin",
    error: "/signin"
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60 // 8 hours
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 5.2 Shopify Client

```typescript
// lib/shopify/client.ts
import { GraphQLClient } from 'graphql-request'

export class ShopifyClient {
  private client: GraphQLClient

  constructor(shop: string, accessToken: string) {
    this.client = new GraphQLClient(
      `https://${shop}/admin/api/2025-10/graphql.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  async getMetrics(days: number = 30) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const query = `
      query GetMetrics($startDate: DateTime!, $endDate: DateTime!) {
        orders(first: 250, query: "created_at:>=$startDate AND created_at:<=$endDate") {
          edges {
            node {
              id
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 50) {
                edges {
                  node {
                    quantity
                  }
                }
              }
              customer {
                id
                numberOfOrders
              }
            }
          }
        }
        customers(first: 250) {
          edges {
            node {
              id
              numberOfOrders
              amountSpent {
                amount
              }
              createdAt
            }
          }
        }
      }
    `

    try {
      const data = await this.client.request(query, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      return this.processMetrics(data)
    } catch (error) {
      console.error('Failed to fetch Shopify metrics:', error)
      throw error
    }
  }

  private processMetrics(data: any) {
    const orders = data.orders.edges
    const customers = data.customers.edges

    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.node.totalPriceSet.shopMoney.amount)
    }, 0)

    const returningCustomers = customers.filter((c: any) =>
      c.node.numberOfOrders > 1
    ).length

    return {
      orders: {
        count: orders.length,
        totalRevenue,
        averageValue: orders.length > 0 ? totalRevenue / orders.length : 0
      },
      customers: {
        total: customers.length,
        returning: returningCustomers,
        new: customers.length - returningCustomers,
        retentionRate: customers.length > 0
          ? (returningCustomers / customers.length) * 100
          : 0
      },
      conversionRate: 2.3, // Would need sessions data from analytics
      lastUpdated: new Date()
    }
  }
}
```

### 5.3 Calculation Engine

```typescript
// lib/calculations/engine.ts
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

export class CalculationEngine {
  private metrics: Metrics

  constructor(metrics: Metrics) {
    this.metrics = metrics
  }

  calculateImpact(adjustments: Adjustments) {
    const currentRevenue = this.calculateRevenue(this.metrics)

    const adjustedMetrics: Metrics = {
      conversionRate: this.metrics.conversionRate * (1 + adjustments.cvrChange / 100),
      averageOrderValue: this.metrics.averageOrderValue * (1 + adjustments.aovChange / 100),
      retentionRate: this.metrics.retentionRate * (1 + adjustments.retentionChange / 100),
      traffic: this.metrics.traffic * (1 + adjustments.trafficChange / 100),
      customerAcquisitionCost: this.metrics.customerAcquisitionCost + adjustments.cacChange
    }

    const projectedRevenue = this.calculateRevenue(adjustedMetrics)
    const revenueIncrease = projectedRevenue - currentRevenue
    const roi = currentRevenue > 0 ? (revenueIncrease / currentRevenue) * 100 : 0

    return {
      current: {
        revenue: currentRevenue,
        metrics: this.metrics
      },
      projected: {
        revenue: projectedRevenue,
        metrics: adjustedMetrics
      },
      impact: {
        revenueIncrease,
        percentageIncrease: roi,
        breakEvenMonths: this.calculateBreakEven(adjustments, revenueIncrease)
      }
    }
  }

  private calculateRevenue(metrics: Metrics): number {
    const customers = metrics.traffic * (metrics.conversionRate / 100)
    const firstTimeRevenue = customers * metrics.averageOrderValue
    const repeatRevenue = customers * (metrics.retentionRate / 100) * metrics.averageOrderValue
    return firstTimeRevenue + repeatRevenue
  }

  private calculateBreakEven(adjustments: Adjustments, monthlyIncrease: number): number {
    // Simplified break-even calculation
    const implementationCost = 10000 // Example fixed cost
    return monthlyIncrease > 0 ? Math.ceil(implementationCost / monthlyIncrease) : Infinity
  }

  compareScenarios(scenarios: Adjustments[]) {
    return scenarios.map((adjustment, index) => ({
      id: `scenario-${index}`,
      adjustments: adjustment,
      results: this.calculateImpact(adjustment)
    }))
  }
}
```

### 5.4 Session Storage Hook

```typescript
// hooks/use-session-storage.ts
import { useState, useEffect } from 'react'

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error)
    }
  }

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
```

### 5.5 Zustand Store

```typescript
// store/index.ts
import { create } from 'zustand'

interface ShopifyStore {
  domain: string
  name: string
  token: string
}

interface Scenario {
  id: string
  name: string
  adjustments: any
  results: any
  createdAt: Date
}

interface AppState {
  // Shopify connection
  currentStore: ShopifyStore | null
  setCurrentStore: (store: ShopifyStore | null) => void

  // Metrics
  metrics: any
  setMetrics: (metrics: any) => void

  // Scenarios
  scenarios: Scenario[]
  addScenario: (scenario: Scenario) => void
  removeScenario: (id: string) => void
  clearScenarios: () => void

  // UI State
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

export const useStore = create<AppState>((set) => ({
  currentStore: null,
  setCurrentStore: (store) => set({ currentStore: store }),

  metrics: null,
  setMetrics: (metrics) => set({ metrics }),

  scenarios: [],
  addScenario: (scenario) =>
    set((state) => ({
      scenarios: [...state.scenarios, scenario].slice(-10) // Keep last 10
    })),
  removeScenario: (id) =>
    set((state) => ({
      scenarios: state.scenarios.filter((s) => s.id !== id)
    })),
  clearScenarios: () => set({ scenarios: [] }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error })
}))
```

## Step 6: Main Components

### 6.1 Dashboard Page

```typescript
// app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { MetricsCard } from '@/components/dashboard/metrics-card'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentStore, metrics, isLoading, setIsLoading } = useStore()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>
  }

  if (!currentStore) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Connect Your Store</h1>
        <Button
          onClick={() => router.push('/api/shopify/connect')}
        >
          Connect Shopify Store
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {currentStore.name} Dashboard
      </h1>

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

      <div className="flex gap-4">
        <Button onClick={() => router.push('/simulator')}>
          Run Simulation
        </Button>
        <Button variant="outline" onClick={() => router.push('/compare')}>
          Compare Scenarios
        </Button>
      </div>
    </div>
  )
}
```

### 6.2 Simulator Component

```typescript
// components/simulator/simulation-panel.tsx
'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CalculationEngine } from '@/lib/calculations/engine'
import { useStore } from '@/store'

export function SimulationPanel() {
  const { metrics, addScenario } = useStore()
  const [adjustments, setAdjustments] = useState({
    cvrChange: 0,
    aovChange: 0,
    retentionChange: 0,
    trafficChange: 0,
    cacChange: 0
  })

  const engine = new CalculationEngine(metrics)
  const results = engine.calculateImpact(adjustments)

  const handleSave = () => {
    const scenario = {
      id: Date.now().toString(),
      name: `Scenario ${new Date().toLocaleString()}`,
      adjustments,
      results,
      createdAt: new Date()
    }
    addScenario(scenario)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Conversion Rate Change: {adjustments.cvrChange}%</Label>
            <Slider
              value={[adjustments.cvrChange]}
              onValueChange={([value]) =>
                setAdjustments({ ...adjustments, cvrChange: value })
              }
              min={-50}
              max={100}
              step={5}
            />
          </div>

          <div>
            <Label>AOV Change: {adjustments.aovChange}%</Label>
            <Slider
              value={[adjustments.aovChange]}
              onValueChange={([value]) =>
                setAdjustments({ ...adjustments, aovChange: value })
              }
              min={-50}
              max={100}
              step={5}
            />
          </div>

          <div>
            <Label>Retention Change: {adjustments.retentionChange}%</Label>
            <Slider
              value={[adjustments.retentionChange]}
              onValueChange={([value]) =>
                setAdjustments({ ...adjustments, retentionChange: value })
              }
              min={-50}
              max={100}
              step={5}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Impact Analysis</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Current Revenue:</span>
              <span className="ml-2">${results.current.revenue.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium">Projected Revenue:</span>
              <span className="ml-2">${results.projected.revenue.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium">Revenue Increase:</span>
              <span className="ml-2 text-green-600">
                ${results.impact.revenueIncrease.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="font-medium">ROI:</span>
              <span className="ml-2 text-green-600">
                {results.impact.percentageIncrease.toFixed(1)}%
              </span>
            </div>
          </div>

          <Button className="mt-4 w-full" onClick={handleSave}>
            Save Scenario
          </Button>
        </div>
      </div>
    </div>
  )
}
```

## Step 7: Run the Application

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel
```

## Step 8: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

## Step 9: Shopify App Setup

1. Go to [Shopify Partners](https://partners.shopify.com)
2. Create a new app
3. Set up OAuth redirect URLs:
   - `http://localhost:3000/api/shopify/callback`
   - `https://your-domain.vercel.app/api/shopify/callback`
4. Request necessary scopes:
   - `read_orders`
   - `read_customers`
   - `read_products`
   - `read_analytics` (if available)
5. Copy API credentials to `.env.local`

## Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Or use Vercel CLI
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add SHOPIFY_APP_API_KEY
vercel env add SHOPIFY_APP_API_SECRET
```

## Troubleshooting

### Common Issues

1. **Google OAuth not working**
   - Ensure @signifly.com is in the 'hd' parameter
   - Check redirect URIs match exactly
   - Verify API is enabled in Google Cloud

2. **Shopify connection fails**
   - Check OAuth scopes are correct
   - Verify redirect URI is whitelisted
   - Ensure HTTPS in production

3. **Session storage not persisting**
   - Check browser settings
   - Verify cookie configuration
   - Check session timeout settings

4. **Calculations incorrect**
   - Verify Shopify data format
   - Check calculation formulas
   - Test with sample data

---

*Implementation Guide Version: 1.0*
*For use with Claude Code or manual setup*
