'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricsCardProps {
  title: string
  value: number
  change?: number
  format: 'currency' | 'percentage' | 'number'
}

export function MetricsCard({ title, value, change, format }: MetricsCardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value)
      case 'percentage':
        return `${value.toFixed(2)}%`
      case 'number':
        return new Intl.NumberFormat('en-US').format(value)
      default:
        return value.toString()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>
        {change !== undefined && (
          <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
