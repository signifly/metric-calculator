import { NextRequest, NextResponse } from 'next/server'
import { ShopifyClient } from '@/lib/shopify/client'

export async function GET(request: NextRequest) {
  try {
    const shop = process.env.SHOPIFY_STORE_DOMAIN
    const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN

    if (!shop || !accessToken) {
      return NextResponse.json(
        { error: 'Shopify credentials not configured. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_TOKEN in .env.local' },
        { status: 500 }
      )
    }

    // Get optional days parameter from query string
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)

    // Fetch metrics from Shopify
    const client = new ShopifyClient(shop, accessToken)
    const metrics = await client.getMetrics(days)

    return NextResponse.json({
      success: true,
      shop,
      metrics
    })
  } catch (error) {
    console.error('Error fetching Shopify metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
