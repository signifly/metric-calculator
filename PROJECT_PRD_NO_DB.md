# Metrics Impact Simulator - Product Requirements Document (No Database Version)

## Executive Summary

**Product Name:** Metrics Impact Simulator
**Version:** 1.0 (MVP - Stateless)
**Purpose:** Internal consultant tool to simulate and demonstrate revenue impact of improving ecommerce metrics using real-time Shopify data
**Primary Users:** Signifly consultants with @signifly.com emails
**Key Difference:** No database - all data is fetched live from Shopify and calculations are session-only

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Core Features](#core-features)
4. [Use Cases](#use-cases)
5. [System Architecture](#system-architecture)
6. [Data Flow](#data-flow)
7. [User Interface](#user-interface)
8. [Security Requirements](#security-requirements)
9. [Implementation Plan](#implementation-plan)
10. [File Structure](#file-structure)

## Project Overview

### Problem Statement
Consultants need a quick way to demonstrate the revenue impact of various ecommerce optimizations using live client data, without the overhead of database management or data persistence.

### Solution Approach
A lightweight, stateless web application that:
- Connects directly to Shopify via OAuth
- Fetches metrics in real-time
- Performs calculations in-browser
- Stores scenarios temporarily in session storage
- Exports results as JSON/CSV for record-keeping

### Key Benefits
- **Zero Infrastructure**: No database to maintain
- **Always Current**: Real-time data from Shopify
- **Fast Setup**: Deploy and use immediately
- **Privacy-First**: No client data stored permanently
- **Cost-Effective**: Minimal hosting requirements

## Technical Stack

### Simplified Architecture
```
Frontend Only Application
├── Next.js 15.5 (App Router)
├── TypeScript
├── Tailwind CSS v4
├── shadcn/ui components
├── NextAuth.js v4 (Google OAuth)
├── Shopify Admin API (GraphQL)
└── Browser Storage (Session/Local)
```

### Dependencies
```json
{
  "dependencies": {
    "next": "^15.5.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-auth": "^4.24.11",
    "@shopify/shopify-api": "latest",
    "graphql-request": "^6.1.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "csv-stringify": "^6.5.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4",
    "autoprefixer": "^10",
    "postcss": "^8",
    "eslint": "^8",
    "eslint-config-next": "^14"
  }
}
```

## Core Features

### 1. Authentication (Simplified)
- Google OAuth with @signifly.com restriction
- Session-based authentication (no user storage)
- JWT tokens for API calls
- Auto-logout after inactivity

### 2. Shopify Connection
- OAuth flow for temporary access
- Token stored in encrypted session cookie
- Real-time metrics fetching
- Multiple store support (switch between)

### 3. Live Metrics Dashboard
```typescript
interface LiveMetrics {
  // Fetched from Shopify
  orders: {
    count: number
    totalRevenue: number
    averageValue: number
  }
  customers: {
    total: number
    returning: number
    new: number
  }
  sessions: {
    total: number
    conversionRate: number
  }
  dateRange: {
    start: Date
    end: Date
  }
  lastUpdated: Date
}
```

### 4. Simulation Engine (Client-Side)
```typescript
interface SimulationEngine {
  // Core calculations
  calculateCVRImpact(current: number, change: number): Revenue
  calculateAOVImpact(current: number, change: number): Revenue
  calculateRetentionImpact(current: number, change: number): Revenue
  calculateTrafficImpact(current: number, change: number): Revenue
  calculateCombinedImpact(adjustments: Adjustments): Revenue
}
```

### 5. Session Storage Management
```typescript
interface SessionData {
  // Stored in browser session
  currentStore: {
    domain: string
    name: string
    token: string // encrypted
  }
  scenarios: Scenario[] // max 10
  comparisons: ComparisonSet[]
  settings: UserPreferences
}
```

### 6. Export Functionality
- Export scenarios as JSON
- Export comparison tables as CSV
- Generate shareable links (URL params)
- Copy calculations to clipboard

## Data Flow

### Connection Flow
```
1. User logs in with Google (@signifly.com)
   ↓
2. Redirected to Shopify OAuth
   ↓
3. Shopify token received
   ↓
4. Token encrypted and stored in session
   ↓
5. Fetch live metrics from Shopify
   ↓
6. Display in dashboard
```

### Calculation Flow
```
1. User adjusts simulation parameters
   ↓
2. Calculations performed in browser
   ↓
3. Results displayed in real-time
   ↓
4. Scenario saved to session storage
   ↓
5. User exports or shares results
```

## System Architecture

### Stateless Architecture
```
┌────────────────────────────────────┐
│         Browser Client             │
│  ┌────────────────────────────┐   │
│  │    Next.js Application     │   │
│  │  ┌──────────────────────┐  │   │
│  │  │  React Components    │  │   │
│  │  │  - Dashboard         │  │   │
│  │  │  - Simulator         │  │   │
│  │  │  - Comparisons       │  │   │
│  │  └──────────────────────┘  │   │
│  │  ┌──────────────────────┐  │   │
│  │  │  State Management    │  │   │
│  │  │  (Zustand)           │  │   │
│  │  └──────────────────────┘  │   │
│  │  ┌──────────────────────┐  │   │
│  │  │  Session Storage     │  │   │
│  │  └──────────────────────┘  │   │
│  └────────────────────────────┘   │
└────────────────────────────────────┘
           ↓            ↓
    Google OAuth   Shopify API
```

### API Routes (Minimal)
```
/api/auth/[...nextauth] - Authentication
/api/shopify/connect    - Initiate OAuth
/api/shopify/callback   - Handle OAuth callback
/api/shopify/metrics    - Fetch live metrics
/api/export/json        - Export scenarios
/api/export/csv         - Export comparisons
```

## User Interface

### Page Structure
```
/                     - Landing/login page
/auth/signin          - Google OAuth page
/dashboard            - Main dashboard
/simulator            - Simulation tool
/compare              - Scenario comparison
/settings             - Preferences
```

### Main Dashboard Components
```typescript
// components/dashboard/metrics-card.tsx
interface MetricsCardProps {
  title: string
  value: number
  change?: number
  format: 'currency' | 'percentage' | 'number'
}

// components/simulator/adjustment-slider.tsx
interface AdjustmentSliderProps {
  metric: 'cvr' | 'aov' | 'retention' | 'traffic'
  currentValue: number
  onChange: (value: number) => void
}

// components/comparison/scenario-table.tsx
interface ScenarioTableProps {
  scenarios: Scenario[]
  onExport: () => void
  onRemove: (id: string) => void
}
```

## File Structure

```
metrics-calculator/
├── app/
│   ├── (auth)/
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── simulator/
│   │   │   └── page.tsx
│   │   ├── compare/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── shopify/
│   │   │   ├── connect/
│   │   │   │   └── route.ts
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   └── metrics/
│   │   │       └── route.ts
│   │   └── export/
│   │       ├── json/
│   │       │   └── route.ts
│   │       └── csv/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── dashboard/
│   ├── simulator/
│   ├── comparison/
│   └── shared/
├── lib/
│   ├── shopify/
│   │   ├── client.ts
│   │   ├── queries.ts
│   │   └── types.ts
│   ├── calculations/
│   │   ├── engine.ts
│   │   ├── formulas.ts
│   │   └── types.ts
│   ├── storage/
│   │   ├── session.ts
│   │   └── cookies.ts
│   └── utils/
│       ├── format.ts
│       └── export.ts
├── hooks/
│   ├── use-shopify.ts
│   ├── use-calculations.ts
│   └── use-session-storage.ts
├── store/
│   └── index.ts      # Zustand store
├── styles/
│   └── globals.css
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Security Requirements

### Authentication Security
- Google OAuth 2.0
- Domain restriction (@signifly.com)
- Session expiry (8 hours)
- HTTPS only

### Data Security
- No permanent data storage
- Encrypted session cookies
- Shopify tokens never exposed to client
- Auto-clear on logout

### API Security
- Rate limiting on API routes
- CORS properly configured
- Input validation with Zod
- XSS protection

## Implementation Plan

### Week 1: Foundation
```
Day 1-2: Project Setup
- [ ] Initialize Next.js 15.5 project
- [ ] Configure TypeScript and Tailwind
- [ ] Set up shadcn/ui components
- [ ] Configure NextAuth with Google

Day 3-4: Shopify Integration
- [ ] Implement OAuth flow
- [ ] Create GraphQL client
- [ ] Build metrics fetching
- [ ] Handle token storage

Day 5: Core UI
- [ ] Create dashboard layout
- [ ] Build metrics cards
- [ ] Implement navigation
- [ ] Add loading states
```

### Week 2: Core Features
```
Day 6-7: Calculation Engine
- [ ] Implement formulas
- [ ] Create simulation logic
- [ ] Build adjustment controls
- [ ] Add real-time updates

Day 8-9: State Management
- [ ] Set up Zustand store
- [ ] Implement session storage
- [ ] Create hooks
- [ ] Handle persistence

Day 10: Comparison Feature
- [ ] Build comparison view
- [ ] Create scenario table
- [ ] Add visual charts
- [ ] Implement exports
```

### Week 3: Polish & Deploy
```
Day 11-12: Testing & Optimization
- [ ] Unit tests for calculations
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Error handling

Day 13-14: Deployment
- [ ] Vercel setup
- [ ] Environment variables
- [ ] Domain configuration
- [ ] Documentation

Day 15: Launch
- [ ] Final testing
- [ ] Team training
- [ ] Go live
```

## Quick Start Commands

```bash
# Create new Next.js project
npx create-next-app@latest metrics-calculator --typescript --tailwind --app

# Navigate to project
cd metrics-calculator

# Install dependencies
npm install next-auth@4 @shopify/shopify-api graphql-request zustand
npm install react-hook-form zod @hookform/resolvers
npm install recharts date-fns csv-stringify
npm install --save-dev @types/node

# Set up shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card form input label
npx shadcn@latest add select slider table tabs
npx shadcn@latest add dialog sheet toast

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Variables

```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# Shopify App
SHOPIFY_APP_API_KEY=your-api-key
SHOPIFY_APP_API_SECRET=your-api-secret
SHOPIFY_APP_SCOPES=read_orders,read_customers,read_products,read_analytics

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SESSION_TIMEOUT=28800000  # 8 hours in ms
```

## Advantages of No-Database Approach

1. **Simplicity**: No database setup or migrations
2. **Cost**: Minimal hosting costs (Vercel free tier)
3. **Privacy**: No client data stored
4. **Maintenance**: No database maintenance
5. **Speed**: Faster development and deployment
6. **Compliance**: Easier GDPR compliance

## Limitations to Consider

1. **No Historical Data**: Can't track changes over time
2. **Session Loss**: Data lost on browser close
3. **No Collaboration**: Can't share scenarios between users
4. **Limited Scenarios**: Storage limited by browser
5. **No Offline Mode**: Requires internet connection

## Future Enhancements

### Phase 2 (Optional Database)
- Add optional Supabase integration
- Historical tracking
- Team collaboration
- Saved templates

### Phase 3 (Advanced Features)
- AI recommendations
- Industry benchmarks
- Advanced visualizations
- White-label option

---

*Document Version: 1.0 (Stateless)*
*Last Updated: October 2025*
*Author: Signifly Development Team*
