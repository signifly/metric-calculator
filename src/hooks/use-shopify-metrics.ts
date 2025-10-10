import { useEffect } from 'react'
import { useStore } from '@/store'
import { toast } from 'sonner'

export function useShopifyMetrics() {
  const { setMetrics, setCurrentStore, setIsLoading, setError } = useStore()

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/shopify/metrics')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch metrics')
        }

        // Set store info
        setCurrentStore({
          domain: data.shop,
          name: data.shop.replace('.myshopify.com', ''),
          token: 'configured' // Not exposing actual token
        })

        // Set metrics
        setMetrics(data.metrics)

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load metrics'
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [setMetrics, setCurrentStore, setIsLoading, setError])
}
