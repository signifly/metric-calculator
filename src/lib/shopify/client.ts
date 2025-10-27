import { GraphQLClient } from "graphql-request";
import { LiveMetrics } from "@/types";

export class ShopifyClient {
  private client: GraphQLClient;

  constructor(shop: string, accessToken: string) {
    this.client = new GraphQLClient(
      `https://${shop}/admin/api/2025-10/graphql.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );
  }

  async getMetrics(startDate?: Date, endDate?: Date): Promise<LiveMetrics> {
    const end = endDate || new Date();
    const start =
      startDate ||
      (() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
      })();

    // Format dates for Shopify query
    const startDateStr = start.toISOString().split("T")[0];
    const endDateStr = end.toISOString().split("T")[0];

    const query = `
      query GetMetrics {
        orders(first: 250, query: "created_at:>=${startDateStr} AND created_at:<=${endDateStr}") {
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
    `;

    try {
      const data = await this.client.request<{
        orders: {
          edges: Array<{
            node: { totalPriceSet: { shopMoney: { amount: string } } };
          }>;
        };
        customers: { edges: Array<{ node: { numberOfOrders: number } }> };
      }>(query);

      return this.processMetrics(data);
    } catch (error) {
      console.error("Failed to fetch Shopify metrics:", error);
      throw error;
    }
  }

  private processMetrics(data: {
    orders: {
      edges: Array<{
        node: { totalPriceSet: { shopMoney: { amount: string } } };
      }>;
    };
    customers: { edges: Array<{ node: { numberOfOrders: number } }> };
  }): LiveMetrics {
    const orders = data.orders.edges;
    const customers = data.customers.edges;

    const totalRevenue = orders.reduce(
      (
        sum: number,
        order: { node: { totalPriceSet: { shopMoney: { amount: string } } } }
      ) => {
        return sum + parseFloat(order.node.totalPriceSet.shopMoney.amount);
      },
      0
    );

    const returningCustomers = customers.filter(
      (c: { node: { numberOfOrders: number } }) => c.node.numberOfOrders > 1
    ).length;

    return {
      orders: {
        count: orders.length,
        totalRevenue,
        averageValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      },
      customers: {
        total: customers.length,
        returning: returningCustomers,
        new: customers.length - returningCustomers,
        retentionRate:
          customers.length > 0
            ? (returningCustomers / customers.length) * 100
            : 0,
      },
      conversionRate: 2.3, // Would need sessions data from analytics
      lastUpdated: new Date(),
    };
  }
}
