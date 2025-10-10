# Shopify Custom App Setup Guide

This application uses a **Custom App** approach (no OAuth required) for accessing Shopify data.

## Step 1: Create a Custom App in Shopify

1. **Log into your Shopify store admin**
   - Go to your store at `https://your-store.myshopify.com/admin`

2. **Navigate to Apps Settings**
   - Click **Settings** (bottom left)
   - Click **Apps and sales channels**
   - Click **Develop apps** (top right)

3. **Create a New App**
   - Click **"Create an app"**
   - Enter app name: `Metrics Impact Simulator`
   - Click **"Create app"**

4. **Configure Admin API Scopes**
   - Click **"Configure Admin API scopes"**
   - Search for and enable these scopes:
     - ✅ `read_orders` - Read orders
     - ✅ `read_customers` - Read customers
     - ✅ `read_products` - Read products
     - ✅ `read_analytics` (optional but recommended) - Read analytics
   - Click **"Save"**

5. **Install the App**
   - Click **"Install app"** (top right)
   - Confirm the installation
   - **Important:** Copy the **Admin API access token** that appears
     - It will look like: `shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
     - **Save this token securely** - you won't be able to see it again!

## Step 2: Configure Environment Variables

1. Open `.env.local` in your project root

2. Update the Shopify configuration:

```env
# Shopify - Custom App (No OAuth)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_your_actual_token_here
```

**Example:**
```env
SHOPIFY_STORE_DOMAIN=acme-store.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_abc123def456ghi789jkl012mno345pqr
```

## Step 3: Restart Your Dev Server

```bash
# Stop your current dev server (Ctrl+C)

# Start it again
pnpm dev
```

## Step 4: Test the Connection

1. Visit `http://localhost:3000/signin`
2. Sign in with your @signifly.com Google account
3. You should be redirected to the dashboard
4. The dashboard should automatically load metrics from your Shopify store

## Troubleshooting

### "Shopify credentials not configured" error
- Make sure `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_API_TOKEN` are set in `.env.local`
- Restart your dev server after updating `.env.local`

### "Failed to fetch metrics" error
- Verify your Admin API token is correct
- Ensure the custom app has the required scopes enabled
- Check that your store domain is in the format: `store-name.myshopify.com`

### Token not working
- Make sure you copied the entire token including the `shpat_` prefix
- Tokens cannot be retrieved again - if lost, you'll need to:
  - Go to your custom app in Shopify admin
  - Uninstall and reinstall the app
  - Copy the new token

## Security Notes

- **Never commit `.env.local` to git** (it's already in `.gitignore`)
- Keep your Admin API token secure
- The token has access to your store data based on the scopes you granted
- You can revoke access anytime by uninstalling the custom app in Shopify

## Optional: Adding More Stores

To work with multiple stores:

1. Create a custom app in each store (following steps above)
2. You can switch between stores by:
   - Creating separate `.env.local.store1`, `.env.local.store2` files
   - Copying the desired config to `.env.local` when needed
   - Or implementing a store switcher (future enhancement)

## What Data is Fetched?

The app fetches the following from Shopify:

- **Orders**: Count, total revenue, average order value
- **Customers**: Total, returning, new, retention rate
- **Date Range**: Last 30 days (customizable)

All data is fetched in real-time when you view the dashboard!

---

**Status**: ✅ Setup complete once you configure the environment variables

**Need Help?** Check the Shopify documentation: https://shopify.dev/docs/apps/build/authentication-authorization
