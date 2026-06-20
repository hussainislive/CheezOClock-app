# Project Detailed Context — CheezOClock (Food Delivery)

> **Single source of truth for this project.**
> A future developer or AI agent should be able to fully understand, navigate, and modify this codebase after reading this document plus `README.md`.

---

## Project Overview

**CheezOClock** is a full-stack food delivery application built as a companion project for the **CodeWithLari** YouTube course. The original upstream repository is `laribright/food-delivery-application`. The local working copy is named `CheezOClock` — this is just a directory rename; all internal package names remain unchanged.

The application implements a complete three-sided marketplace:

| Role | What they do |
|---|---|
| **Customer** | Browse restaurants, view menus, add to cart, pay via Stripe, track order live on a map |
| **Restaurant Owner** | Register restaurant, manage categories/menu items, receive/update orders, view analytics |
| **Driver** | Toggle online, receive assigned orders via WebSocket, broadcast GPS location, mark delivered |

---

## Executive Summary

| Aspect | Detail |
|---|---|
| Monorepo manager | pnpm workspaces |
| Backend | NestJS 11 (Node.js) |
| Mobile | Expo 55 + Expo Router (React Native 0.83.6) |
| Database | Neon (serverless Postgres) via Drizzle ORM |
| Cache / GPS | Upstash Redis (REST-based) |
| Payments | Stripe (Payment Sheet + Webhooks) |
| Real-time | Socket.IO — `/orders` namespace |
| File uploads | UploadThing |
| Shared types | `@food-delivery/types` workspace package |
| Primary brand color | `#FF6B35` (orange) |
| Splash background | `#208AEF` (blue) |

---

## Project Purpose

This is an **educational reference implementation** that demonstrates:
- pnpm monorepo with shared TypeScript types
- NestJS feature-module architecture with JWT + RBAC
- Drizzle ORM with type-safe schema migrations (push-based)
- Stripe Payment Sheet flow + webhook confirmation
- Socket.IO rooms for real-time order updates and driver GPS
- Upstash Redis for cache-aside (restaurants, menus) and driver location persistence
- Expo Router file-based navigation with role-protected stacks
- Zustand for cart state management
- React Query (TanStack Query v5) for server state

---

## Repository Structure

### Complete Folder Tree

```
CheezOClock/                         ← repo root
├── .gitignore
├── .pnpm-store/                     ← local pnpm content-addressable store (gitignored)
├── .vscode/
│   ├── extensions.json              ← recommended extensions
│   └── settings.json                ← workspace settings
├── README.md                        ← quick-start guide
├── package.json                     ← root: dev scripts, concurrently dep
├── pnpm-lock.yaml                   ← lockfile
├── pnpm-workspace.yaml              ← workspace definition
├── tsconfig.base.json               ← shared TS strict settings
│
├── apps/
│   ├── api/                         ← NestJS backend
│   │   ├── .env.example
│   │   ├── .prettierrc
│   │   ├── .vscode/
│   │   ├── README.md
│   │   ├── drizzle.config.ts        ← Drizzle Kit config
│   │   ├── eslint.config.mjs
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── src/
│   │   │   ├── main.ts              ← bootstrap, CORS, prefix, UploadThing route
│   │   │   ├── app.module.ts        ← root module, wires all feature modules
│   │   │   ├── app.controller.ts    ← health check GET /api
│   │   │   ├── app.service.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts   ← POST /api/auth/register, /login, GET /me
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   └── roles.decorator.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   └── login.dto.ts
│   │   │   │   └── guards/
│   │   │   │       ├── jwt-auth.guard.ts
│   │   │   │       └── roles.guard.ts
│   │   │   ├── cache/
│   │   │   │   ├── cache.module.ts
│   │   │   │   ├── cache.service.ts     ← Upstash Redis wrapper (get/set/del)
│   │   │   │   └── cache-keys.ts        ← typed key constants
│   │   │   ├── db/
│   │   │   │   ├── db.module.ts         ← @Global module providing 'DB' token
│   │   │   │   ├── index.ts             ← drizzle(neon(…)) singleton
│   │   │   │   └── schema/
│   │   │   │       ├── index.ts         ← re-exports all tables
│   │   │   │       ├── users.ts
│   │   │   │       ├── restaurants.ts
│   │   │   │       ├── menus.ts
│   │   │   │       ├── orders.ts
│   │   │   │       └── reviews.ts
│   │   │   ├── driver/
│   │   │   │   ├── driver.module.ts
│   │   │   │   ├── driver.controller.ts ← PATCH /api/driver/online, GET /status
│   │   │   │   └── driver.service.ts    ← toggle, assign, decline
│   │   │   ├── gateway/
│   │   │   │   ├── gateway.module.ts
│   │   │   │   └── orders.gateway.ts    ← Socket.IO /orders namespace
│   │   │   ├── location/
│   │   │   │   ├── location.module.ts
│   │   │   │   ├── location.controller.ts ← GET /api/location/:orderId
│   │   │   │   └── location.service.ts    ← Redis key: driver:location:<orderId>
│   │   │   ├── menu/
│   │   │   │   ├── menu.module.ts
│   │   │   │   ├── menu.controller.ts
│   │   │   │   ├── menu.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-category.dto.ts
│   │   │   │       ├── update-category.dto.ts
│   │   │   │       ├── create-menu-item.dto.ts
│   │   │   │       └── update-menu-item.dto.ts
│   │   │   ├── orders/
│   │   │   │   ├── orders.module.ts
│   │   │   │   ├── orders.controller.ts
│   │   │   │   ├── orders.service.ts    ← state machine, enrichment
│   │   │   │   └── dto/
│   │   │   │       ├── create-order.dto.ts
│   │   │   │       ├── order-item.dto.ts
│   │   │   │       └── update-status.dto.ts
│   │   │   ├── payments/
│   │   │   │   ├── payments.module.ts
│   │   │   │   ├── payments.controller.ts
│   │   │   │   ├── payments.service.ts  ← Stripe intent + webhook
│   │   │   │   └── dto/
│   │   │   │       └── create-payment-intent.dto.ts
│   │   │   ├── restaurants/
│   │   │   │   ├── restaurants.module.ts
│   │   │   │   ├── restaurants.controller.ts
│   │   │   │   ├── restaurants.service.ts ← with Redis cache-aside
│   │   │   │   └── dto/
│   │   │   │       ├── create-restaurant.dto.ts
│   │   │   │       └── update-restaurant.dto.ts
│   │   │   ├── reviews/
│   │   │   │   ├── reviews.module.ts
│   │   │   │   ├── reviews.controller.ts
│   │   │   │   ├── reviews.service.ts   ← rating sync
│   │   │   │   └── dto/
│   │   │   │       └── create-review.dto.ts
│   │   │   └── uploadthing/
│   │   │       └── upload-router.ts     ← restaurantImage + menuItemImage routes
│   │   └── test/
│   │       ├── app.e2e-spec.ts
│   │       └── jest-e2e.json
│   │
│   └── mobile/                      ← Expo React Native app
│       ├── .claude/settings.json
│       ├── .env.example
│       ├── .prettierrc
│       ├── .vscode/
│       ├── AGENTS.md                ← instructs AI agents to read Expo v55 docs
│       ├── CLAUDE.md                ← includes AGENTS.md
│       ├── README.md
│       ├── app.config.ts            ← Expo config: name, icons, plugins, Google Maps
│       ├── eslint.config.mjs
│       ├── package.json
│       ├── tsconfig.json            ← extends expo/tsconfig.base, @/* alias
│       ├── scripts/
│       │   └── reset-project.js
│       ├── assets/
│       │   ├── expo.icon/           ← iOS icon
│       │   └── images/              ← splash, favicon, tab icons, logo
│       └── src/
│           ├── global.css           ← CSS reset (used by web variant)
│           ├── app/
│           │   ├── _layout.tsx      ← root: QueryClient, Stripe, Auth providers
│           │   ├── index.tsx        ← role-based redirect entry point
│           │   ├── login.tsx
│           │   ├── register.tsx
│           │   ├── health.tsx
│           │   ├── explore.tsx
│           │   ├── (customer)/
│           │   │   ├── _layout.tsx
│           │   │   ├── order/[id].tsx   ← order tracking + map + rating modal
│           │   │   └── (tabs)/
│           │   │       ├── _layout.tsx  ← NativeTabs: Home, Search, Cart, Orders, Profile
│           │   │       ├── cart.tsx
│           │   │       ├── orders.tsx
│           │   │       ├── search.tsx
│           │   │       ├── profile.tsx
│           │   │       └── (home)/
│           │   │           ├── _layout.tsx
│           │   │           ├── index.tsx           ← restaurant list + debounced search
│           │   │           └── restaurant/[id].tsx ← restaurant detail + menu + cart
│           │   ├── (owner)/
│           │   │   ├── _layout.tsx
│           │   │   ├── analytics.tsx
│           │   │   ├── menu.tsx
│           │   │   ├── profile.tsx
│           │   │   └── (index)/
│           │   │       ├── _layout.tsx
│           │   │       ├── index.tsx           ← orders dashboard + toggle open/closed
│           │   │       ├── create-restaurant.tsx
│           │   │       └── edit-restaurant.tsx
│           │   └── (driver)/
│           │       ├── _layout.tsx
│           │       ├── index.tsx        ← online toggle + incoming order modal
│           │       ├── active.tsx       ← GPS tracking + mark delivered
│           │       ├── history.tsx
│           │       └── profile.tsx
│           ├── components/
│           │   ├── animated-icon.tsx        ← splash overlay animation
│           │   ├── animated-icon.web.tsx    ← web variant
│           │   ├── animated-icon.module.css
│           │   ├── app-tabs.tsx
│           │   ├── app-tabs.web.tsx
│           │   ├── external-link.tsx
│           │   ├── hint-row.tsx
│           │   ├── rating-modal.tsx         ← star rating bottom sheet
│           │   ├── themed-text.tsx
│           │   ├── themed-view.tsx
│           │   ├── web-badge.tsx
│           │   └── ui/
│           │       └── collapsible.tsx
│           ├── constants/
│           │   └── theme.ts          ← Colors (light/dark), Fonts, Spacing, BottomTabInset
│           ├── context/
│           │   └── auth-context.tsx  ← AuthProvider, useAuth hook
│           ├── hooks/
│           │   ├── use-color-scheme.ts
│           │   ├── use-color-scheme.web.ts
│           │   ├── use-debounce.ts
│           │   ├── use-order-socket.ts  ← useOrderSocket, useRestaurantSocket, useDriverLocationSocket
│           │   └── use-theme.ts
│           ├── lib/
│           │   ├── auth.ts           ← SecureStore token helpers
│           │   ├── axios.ts          ← pre-configured axios with JWT interceptor
│           │   └── uploadthing.ts    ← generateReactNativeHelpers typed to API router
│           └── store/
│               └── cart-store.ts     ← Zustand cart store
│
└── packages/
    └── types/
        ├── package.json              ← name: @food-delivery/types
        └── index.ts                  ← all shared TypeScript types
```

---

## Monorepo Architecture

```
pnpm-workspace.yaml
  packages:
    - 'apps/*'      → api, mobile
    - 'packages/*'  → @food-delivery/types
```

```
            ┌──────────────────────┐
            │  @food-delivery/types │  (packages/types)
            │  Shared TS interfaces │
            └───────────┬──────────┘
                        │ workspace:*
            ┌───────────┴──────────────────┐
            │                              │
     ┌──────▼──────┐              ┌────────▼────────┐
     │  apps/api   │              │  apps/mobile    │
     │  NestJS     │◄─ HTTP/WS ──►│  Expo RN        │
     └─────────────┘              └─────────────────┘
```

Both `apps/api` and `apps/mobile` declare `"@food-delivery/types": "workspace:*"` in their `package.json` dependencies. There is no build step for the types package — it is consumed directly as TypeScript source (the `main` field points to `index.ts`).

**Critical cross-package type reference:** The mobile app also imports the API's `OurFileRouter` type directly via a relative path in [apps/mobile/src/lib/uploadthing.ts](apps/mobile/src/lib/uploadthing.ts):
```ts
import type { OurFileRouter } from '../../../api/src/uploadthing/upload-router';
```
This means the mobile and API packages are tightly coupled through this single UploadThing type import, beyond just the `@food-delivery/types` package.

---

## Technology Stack

### Development Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Package manager | pnpm | ^11.1.3 | Monorepo, fast installs, workspace linking |
| Language | TypeScript | ~5.9.2 (mobile), ^5.7.3 (api) | Type safety across the stack |
| Node.js | Node.js | 24+ (implied by @types/node ^24) | API runtime |
| Concurrent dev | concurrently | ^9.2.1 | Run API + mobile simultaneously |

### Backend (apps/api)

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Framework | NestJS | ^11.0.1 | Modular Node.js server framework |
| HTTP server | Express (via @nestjs/platform-express) | ^11.0.1 | Underlying HTTP adapter |
| WebSocket | Socket.IO | ^4.8.3 | Real-time orders namespace |
| Database client | @neondatabase/serverless | ^1.1.0 | Neon Postgres HTTP driver |
| ORM | Drizzle ORM | ^0.45.2 | Type-safe SQL query builder |
| ORM CLI | drizzle-kit | ^0.31.10 | Schema push + studio |
| Auth | @nestjs/jwt | ^11.0.2 | JWT sign/verify |
| Password hashing | bcrypt | ^6.0.0 | Hash passwords at cost 10 |
| Validation | class-validator + class-transformer | ^0.15.1 / ^0.5.1 | DTO validation via decorators |
| Cache | @upstash/redis | ^1.38.0 | Redis REST client for caching + GPS |
| Payments | stripe | ^22.2.0 | Payment intents + webhooks |
| File uploads | uploadthing | ^7.7.4 | Express handler mounted at /api/uploadthing |
| Config | @nestjs/config | ^4.0.4 | Loads .env via ConfigModule.forRoot |

### Mobile (apps/mobile)

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Expo | ~55.0.25 | Managed/bare React Native toolchain |
| React | React 19 | 19.2.0 | UI library |
| React Native | React Native | 0.83.6 | Native mobile rendering |
| Router | expo-router | ~55.0.15 | File-based navigation |
| HTTP client | axios | ^1.16.1 | API calls with JWT interceptor |
| Server state | @tanstack/react-query | ^5.100.11 | Data fetching, caching, mutation |
| Client state | zustand | ^5.0.14 | Cart state (in-memory) |
| WebSocket | socket.io-client | ^4.8.3 | Real-time order + GPS updates |
| Maps | react-native-maps | 1.27.2 | Driver location display (MapView, Marker) |
| Payments | @stripe/stripe-react-native | 0.63.0 | Payment Sheet integration |
| Location | expo-location | ~55.1.10 | Driver GPS broadcasting |
| Secure storage | expo-secure-store | ^56.0.4 | JWT token persistence |
| File uploads | @uploadthing/expo | ^7.2.6 | Image picker + upload to UploadThing |
| Gestures | react-native-gesture-handler | ~2.30.0 | Touch gesture support |
| Animations | react-native-reanimated | 4.2.1 | Animated splash overlay |
| Glass effect | expo-glass-effect | ~55.0.11 | UI effects |
| Navigation | @react-navigation/native + bottom-tabs | ^7.x | Navigation primitives used by expo-router |

---

## Runtime Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Mobile (Expo / React Native)                 │
│                                                                       │
│  auth-context ─── axios ──────────────────── HTTP REST ────────────► │
│  useOrderSocket ── socket.io-client ──────── WS /orders ───────────► │
│  useDriverLocationSocket                                              │
│  useCartStore (Zustand)                                               │
│  useQuery / useMutation (React Query)                                 │
│  Stripe Payment Sheet                                                 │
│  expo-location (GPS watchPositionAsync)                               │
│  expo-secure-store (JWT persistence)                                  │
└──────────────────────────────┬────────────────────────────────────────┘
                               │ HTTP :3000/api  +  WS :3000/orders
┌──────────────────────────────▼────────────────────────────────────────┐
│                         NestJS API (apps/api)                         │
│                                                                       │
│  main.ts ─── app.module.ts                                            │
│  │            ├── ConfigModule (env vars)                             │
│  │            ├── CacheModule → CacheService (Upstash Redis)          │
│  │            ├── DbModule @Global → 'DB' token (Drizzle/Neon)        │
│  │            ├── AuthModule → JWT guards                             │
│  │            ├── RestaurantsModule                                   │
│  │            ├── MenuModule                                          │
│  │            ├── OrdersModule ──────────────────────────────────►    │
│  │            ├── PaymentsModule (Stripe)                             │
│  │            ├── GatewayModule (Socket.IO /orders)                   │
│  │            ├── DriverModule                                        │
│  │            ├── LocationModule (Upstash Redis GPS)                  │
│  │            └── ReviewsModule                                       │
│  │                                                                    │
│  └── /api/uploadthing (Express middleware, UploadThing)               │
└──────────────────────────────┬────────────────────────────────────────┘
               │                │                      │
     ┌─────────▼──────┐  ┌──────▼───────┐   ┌─────────▼──────────┐
     │ Neon Postgres  │  │ Upstash Redis│   │ External services  │
     │ (serverless)   │  │ (REST-based) │   │ Stripe, UploadThing│
     └────────────────┘  └──────────────┘   └────────────────────┘
```

---

## Database Schema

### Tables

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | defaultRandom() |
| first_name | text NOT NULL | |
| last_name | text NOT NULL | |
| email | text NOT NULL UNIQUE | |
| password | text NOT NULL | bcrypt hash |
| role | enum | CUSTOMER \| RESTAURANT_OWNER \| DRIVER, default CUSTOMER |
| push_token | text NULL | for future push notifications |
| is_online | boolean | driver availability flag, default false |
| created_at | timestamp | defaultNow() |
| updated_at | timestamp | defaultNow() |

#### `restaurants`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| owner_id | uuid FK → users.id | CASCADE delete |
| name | text NOT NULL | |
| description | text NULL | |
| image_url | text NULL | UploadThing URL |
| address | text NOT NULL | |
| cuisine_type | text NOT NULL | |
| is_open | boolean | default false |
| rating | numeric(3,2) | updated after each review, default '0' |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `menu_categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| restaurant_id | uuid FK → restaurants.id | CASCADE delete |
| name | text NOT NULL | |
| created_at | timestamp | |

#### `menu_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| category_id | uuid FK → menu_categories.id | CASCADE delete |
| restaurant_id | uuid FK → restaurants.id | CASCADE delete |
| name | text NOT NULL | |
| description | text NULL | |
| price | numeric(10,2) NOT NULL | |
| image_url | text NULL | |
| is_available | boolean | default true |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `orders`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK → users.id | no cascade |
| restaurant_id | uuid FK → restaurants.id | no cascade |
| driver_id | uuid FK → users.id NULL | set when READY → driver assigned |
| status | enum | see Order State Machine below |
| total_amount | numeric(10,2) NOT NULL | calculated server-side |
| delivery_address | text NOT NULL | typed by customer at checkout |
| stripe_payment_intent_id | text NULL | set when payment intent created |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK → orders.id | CASCADE delete |
| menu_item_id | uuid FK → menu_items.id | no cascade |
| quantity | numeric NOT NULL | |
| unit_price | numeric(10,2) NOT NULL | price snapshot at order time |
| created_at | timestamp | |

#### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK → users.id | |
| restaurant_id | uuid FK → restaurants.id | |
| order_id | uuid FK → orders.id UNIQUE | CASCADE delete; one review per order |
| driver_id | uuid FK → users.id NULL | null if no driver involved |
| restaurant_rating | integer NOT NULL | 1-5 |
| driver_rating | integer NULL | 1-5, optional |
| comment | text NULL | |
| created_at | timestamp | |

### Enums (PostgreSQL)

```sql
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER');
CREATE TYPE order_status AS ENUM (
  'PENDING', 'CONFIRMED', 'PREPARING', 'READY',
  'PICKED_UP', 'DELIVERED', 'CANCELLED'
);
```

---

## Order State Machine

```
PENDING ──(Stripe webhook)──► CONFIRMED ──(owner)──► PREPARING ──(owner)──► READY
                                                         │ or CANCELLED        │
                                                                        (driver assigned)
                                                                               │
                                                                               ▼
                                                        CANCELLED ◄── PICKED_UP ──(driver)──► DELIVERED
```

**Transition rules** (enforced by `OrdersService.validateTransition`):

| Role | From | Allowed transitions |
|---|---|---|
| System (Stripe webhook) | PENDING | → CONFIRMED |
| RESTAURANT_OWNER | CONFIRMED | → PREPARING, CANCELLED |
| RESTAURANT_OWNER | PREPARING | → READY, CANCELLED |
| DRIVER | READY | → PICKED_UP |
| DRIVER | PICKED_UP | → DELIVERED |

When status reaches `READY`, `DriverService.assignDriver()` is called automatically. It picks the **first** online driver from the database (no proximity logic) and emits `driver:assigned` to that driver's Socket.IO room.

---

## API Endpoints

All routes are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path | Guard | Body | Response |
|---|---|---|---|---|
| POST | `/register` | none | `{ firstName, lastName, email, password, role }` | `{ user, token }` |
| POST | `/login` | none | `{ email, password }` | `{ user, token }` |
| GET | `/me` | JwtAuthGuard | — | JwtPayload |

### Restaurants — `/api/restaurants`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/` | JWT + RESTAURANT_OWNER | One restaurant per owner enforced |
| GET | `/mine` | JWT + RESTAURANT_OWNER | Returns owner's restaurant or null |
| GET | `/` | JWT | `?search=` optional; open restaurants only; cached |
| GET | `/:id` | JWT | Single restaurant |
| PATCH | `/:id` | JWT + RESTAURANT_OWNER | Partial update; cache invalidated |

### Menu — `/api/menu`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/categories` | JWT + RESTAURANT_OWNER | |
| GET | `/categories/:restaurantId` | none | Cached 300s |
| PATCH | `/categories/:id` | JWT + RESTAURANT_OWNER | |
| DELETE | `/categories/:id` | JWT + RESTAURANT_OWNER | Cascade deletes items |
| POST | `/items` | JWT + RESTAURANT_OWNER | |
| GET | `/items/:restaurantId` | none | Cached 300s |
| PATCH | `/items/:id` | JWT + RESTAURANT_OWNER | |
| DELETE | `/items/:id` | JWT + RESTAURANT_OWNER | |

### Orders — `/api/orders`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/` | JWT + CUSTOMER | Creates order + items, total calculated server-side |
| GET | `/mine` | JWT + CUSTOMER or DRIVER | Routes by role |
| GET | `/restaurant` | JWT + RESTAURANT_OWNER | All orders for owner's restaurant |
| PATCH | `/:id/status` | JWT + RESTAURANT_OWNER or DRIVER | State machine enforced |
| GET | `/:id` | JWT (any role) | Role-based access check |

### Payments — `/api/payments`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/intent` | JWT + CUSTOMER | Returns `{ clientSecret }` |
| POST | `/webhook` | none (raw body) | Stripe signature verified |

### Driver — `/api/driver`

| Method | Path | Guard | Notes |
|---|---|---|---|
| PATCH | `/online` | JWT + DRIVER | Toggles isOnline |
| GET | `/status` | JWT + DRIVER | Returns `{ isOnline }` |
| POST | `/orders/:id/decline` | JWT + DRIVER | Clears assignment, re-assigns |

### Location — `/api/location`

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/:orderId` | JWT | Returns `{ latitude, longitude }` or null |

### Reviews — `/api/reviews`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/` | JWT + CUSTOMER | Requires DELIVERED status, one per order |
| GET | `/restaurant/:restaurantId` | JWT | All reviews for restaurant |
| GET | `/restaurant/:restaurantId/average` | JWT | `{ restaurantId, averageRating }` |
| GET | `/driver/:driverId/average` | JWT | `{ driverId, averageRating }` |
| GET | `/order/:orderId/status` | JWT + CUSTOMER | `{ reviewed: boolean }` |

### UploadThing — `/api/uploadthing`

Mounted as Express middleware. Accepts multipart uploads for:
- `restaurantImage` — 4MB max, 1 file
- `menuItemImage` — 4MB max, 1 file

---

## Socket.IO Real-Time Protocol

**Namespace:** `/orders`
**Transport:** WebSocket only (configured on both client and server)

### Rooms

| Room pattern | Who joins | What they receive |
|---|---|---|
| `order:<orderId>` | Customer tracking screen | `order:updated`, `driver:location` |
| `restaurant:<restaurantId>` | Restaurant owner dashboard | `order:updated` |
| `driver:<driverId>` | Driver home screen | `driver:assigned` |

### Client → Server events

| Event | Payload | Effect |
|---|---|---|
| `join:order` | orderId (string) | client joins `order:<orderId>` room |
| `join:restaurant` | restaurantId (string) | client joins `restaurant:<restaurantId>` room |
| `join:driver` | driverId (string) | client joins `driver:<driverId>` room |
| `driver:location` | `{ driverId, orderId, latitude, longitude }` | stored in Redis (1h TTL), forwarded to `order:<orderId>` room |

### Server → Client events

| Event | Sent to | Payload |
|---|---|---|
| `order:updated` | `order:<id>` + `restaurant:<restaurantId>` | full order object |
| `driver:assigned` | `driver:<driverId>` | order object |
| `driver:location` | `order:<orderId>` | `{ driverId, orderId, latitude, longitude }` |

---

## Redis Usage (Upstash)

Two separate concerns use the same Upstash Redis instance via REST API.

### Cache (CacheService — `apps/api/src/cache/`)

| Key | TTL | Set when | Invalidated when |
|---|---|---|---|
| `restaurants:all` | 300s | GET /restaurants (no search) | restaurant created or updated |
| `restaurants:<id>` | n/a | not currently SET via this key | restaurant updated (key deleted) |
| `menu:categories:<restaurantId>` | 300s | GET /menu/categories/:id | category created/updated/deleted |
| `menu:items:<restaurantId>` | 300s | GET /menu/items/:id | item created/updated/deleted |

**Note:** Search queries (`?search=`) bypass the cache entirely — they always hit the database.

### GPS Location (LocationService — `apps/api/src/location/`)

| Key | TTL | Value |
|---|---|---|
| `driver:location:<orderId>` | 3600s | JSON: `{ latitude, longitude }` |

This key is written by the `driver:location` WebSocket event and read by `GET /api/location/:orderId` (HTTP fallback for late-joining customers).

---

## Authentication Flow

```
Mobile                              API
  │                                  │
  ├── POST /api/auth/register ───────►│
  │   { firstName, lastName,          │  1. check email uniqueness
  │     email, password, role }       │  2. bcrypt.hash(password, 10)
  │                                  │  3. insert user
  │◄── { user, token } ──────────────│  4. jwtService.sign({ sub, email, role })
  │                                  │
  ├── SecureStore.setItemAsync(token) │
  │                                  │
  ├── Future requests:               │
  │   Authorization: Bearer <token>  │  JwtAuthGuard verifies → sets req.user
  │                                  │  RolesGuard checks req.user.role
```

**Token expiry:** 7 days (`expiresIn: '7d'`).

**Session restoration:** On app launch, `AuthProvider` calls `getToken()` from SecureStore, then `GET /api/auth/me`. If the token is expired or invalid, the token is deleted and the user is redirected to login.

**Password never returned:** `sanitizeUser()` in `AuthService` destructures and voids the password field before returning.

---

## Mobile Navigation Architecture

Expo Router file-based routing maps directly to the folder structure under `src/app/`.

```
src/app/
├── _layout.tsx        ← Root Stack: QueryClient + Stripe + Auth providers
├── index.tsx          ← Redirect: checks role → (customer) | (owner) | (driver)
├── login.tsx
├── register.tsx
│
├── (customer)/        ← Stack.Protected: requires user.role === CUSTOMER
│   ├── _layout.tsx
│   ├── order/[id].tsx ← deep-linked order tracking
│   └── (tabs)/        ← NativeTabs (5 tabs)
│       ├── (home)/    ← nested stack for restaurant navigation
│       │   ├── index.tsx
│       │   └── restaurant/[id].tsx
│       ├── search.tsx
│       ├── cart.tsx
│       ├── orders.tsx
│       └── profile.tsx
│
├── (owner)/           ← Stack.Protected: requires user.role === RESTAURANT_OWNER
│   ├── _layout.tsx
│   ├── (index)/
│   │   ├── index.tsx           ← orders + open/close toggle
│   │   ├── create-restaurant.tsx
│   │   └── edit-restaurant.tsx
│   ├── analytics.tsx
│   ├── menu.tsx
│   └── profile.tsx
│
└── (driver)/          ← Stack.Protected: requires user.role === DRIVER
    ├── _layout.tsx
    ├── index.tsx       ← online toggle + incoming order modal
    ├── active.tsx      ← live GPS delivery screen
    ├── history.tsx
    └── profile.tsx
```

### Route Protection

`Stack.Protected` with `guard` prop on role groups in `_layout.tsx`:
```tsx
<Stack.Protected guard={!!user && user.role === UserRole.CUSTOMER}>
  <Stack.Screen name="(customer)" />
</Stack.Protected>
```

Unauthenticated users are redirected to `/login` by `index.tsx`.

### NativeTabs

The customer experience uses `NativeTabs` from `expo-router/unstable-native-tabs`. Icons use platform-native icon sets (`sf` for iOS SF Symbols, `md` for Material Design on Android).

---

## State Management

### Server State — TanStack Query (React Query v5)

Used throughout all screens for data fetching and mutation.

**Key query keys:**
| queryKey | Screen | Endpoint |
|---|---|---|
| `['restaurants', debouncedSearch]` | CustomerHomeScreen | GET /restaurants |
| `['restaurant', id]` | RestaurantDetail | GET /restaurants/:id |
| `['categories', id]` | RestaurantDetail, OwnerMenu | GET /menu/categories/:id |
| `['menu-items', id]` | RestaurantDetail, OwnerMenu | GET /menu/items/:id |
| `['order', id]` | OrderConfirmation | GET /orders/:id |
| `['my-restaurant']` | OwnerHome, OwnerMenu, Analytics | GET /restaurants/mine |
| `['restaurant-orders']` | OwnerHome, Analytics | GET /orders/restaurant |
| `['driver-status']` | DriverHome | GET /driver/status |
| `['driver-active-orders']` | DriverActive | GET /orders/mine (PICKED_UP) |

**WebSocket → React Query cache bridge (OrderConfirmation):**
```ts
queryClient.setQueryData(['order', id], (old) => ({ ...old, ...orderUpdate }));
```
This pattern avoids a redundant HTTP refetch when a WebSocket event arrives.

### Client State — Zustand (Cart)

`useCartStore` in [apps/mobile/src/store/cart-store.ts](apps/mobile/src/store/cart-store.ts):
- Tracks `items: CartItem[]`, `restaurantId`, `restaurantName`
- Enforces single-restaurant invariant: adding from a different restaurant clears the cart (with user confirmation from the restaurant detail screen)
- Cart is **in-memory only** — not persisted across app restarts

### Auth State — React Context

`AuthProvider` in [apps/mobile/src/context/auth-context.tsx](apps/mobile/src/context/auth-context.tsx):
- Stores `user: User | null` and `isLoading: boolean`
- Exposes `login()`, `register()`, `logout()`
- Token is persisted in `expo-secure-store`; user object lives only in React state

---

## Configuration Files

### Root

| File | Purpose |
|---|---|
| [pnpm-workspace.yaml](pnpm-workspace.yaml) | Declares workspace packages |
| [tsconfig.base.json](tsconfig.base.json) | Shared TS options: strict, esModuleInterop, skipLibCheck |
| [package.json](package.json) | Root scripts: dev, dev:api, dev:mobile |

### API (`apps/api`)

| File | Purpose |
|---|---|
| [tsconfig.json](apps/api/tsconfig.json) | Extends base; module: nodenext; decorators; target ES2023 |
| [tsconfig.build.json](apps/api/tsconfig.build.json) | Excludes test files for production build |
| [nest-cli.json](apps/api/nest-cli.json) | NestJS CLI: sourceRoot=src, deleteOutDir=true |
| [drizzle.config.ts](apps/api/drizzle.config.ts) | Schema path, dialect postgresql, dbCredentials from env |
| [eslint.config.mjs](apps/api/eslint.config.mjs) | ESLint flat config with TypeScript and Prettier |
| [.prettierrc](apps/api/.prettierrc) | Prettier options |

### Mobile (`apps/mobile`)

| File | Purpose |
|---|---|
| [app.config.ts](apps/mobile/app.config.ts) | Expo config: app name ("mobile"), icons, schemes, plugins, experiments |
| [tsconfig.json](apps/mobile/tsconfig.json) | Extends expo/tsconfig.base; paths: `@/*` → `./src/*` |
| [eslint.config.mjs](apps/mobile/eslint.config.mjs) | ESLint flat config |

**Important `app.config.ts` settings:**
- `name`: `'mobile'` — **change this to rebrand**
- `slug`: `'mobile'` — used by Expo EAS
- `scheme`: `'mobile'` — deep link scheme
- `merchantIdentifier`: `'merchant.com.fooddelivery.mobile'` — Apple Pay merchant ID
- Google Maps key: loaded from `GOOGLE_MAPS_API_KEY` env var
- Splash background: `#208AEF`
- React Compiler: enabled (experimental)
- Typed routes: enabled (experimental)

---

## Environment Variables

### API (`apps/api/.env`)

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` | Neon Postgres connection string |
| `JWT_SECRET` | ✅ | (random base64 string) | Signs/verifies JWT tokens |
| `STRIPE_SECRET_KEY` | ✅ | `sk_test_xxx` | Stripe server-side key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | `whsec_xxx` | Verifies Stripe webhook signatures |
| `UPSTASH_REDIS_REST_URL` | ✅ | `https://xxx.upstash.io` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | `AXxx...` | Upstash Redis auth token |
| `UPLOADTHING_TOKEN` | ✅ | `sk_live_xxx` | UploadThing API token |
| `PORT` | ❌ | `3000` | Server port (defaults to 3000) |

### Mobile (`apps/mobile/.env`)

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | `http://localhost:3000/api` | Base URL for all REST API calls |
| `EXPO_PUBLIC_SERVER_URL` | ✅ | `http://localhost:3000` | Socket.IO connection + UploadThing base |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | `pk_test_xxx` | Stripe client-side key |
| `GOOGLE_MAPS_API_KEY` | ✅ (Android) | `AIza...` | Android Google Maps tile rendering |

**Important:** On a physical device, replace `localhost` with your machine's LAN IP, e.g. `http://192.168.1.10:3000/api`.

---

## Available Scripts

### Root

```bash
pnpm dev          # Run API (watch) + mobile (iOS) concurrently
pnpm dev:api      # pnpm --filter api run start:dev
pnpm dev:mobile   # pnpm --filter mobile run start --ios
```

### API (`apps/api`)

```bash
pnpm start:dev    # NestJS watch mode with hot reload
pnpm build        # Compile to dist/
pnpm start        # Start compiled app (nest start)
pnpm start:prod   # node dist/main (production)
pnpm start:debug  # Watch mode with Node.js inspector
pnpm db:push      # Push Drizzle schema to Neon (creates/alters tables)
pnpm db:studio    # Open Drizzle Studio (web GUI for database)
pnpm lint         # ESLint with --fix
pnpm format       # Prettier --write on src/** and test/**
pnpm test         # Jest (unit tests, *.spec.ts in src/)
pnpm test:watch   # Jest in watch mode
pnpm test:cov     # Jest with coverage
pnpm test:e2e     # Jest with jest-e2e.json config
```

### Mobile (`apps/mobile`)

```bash
pnpm start        # Expo dev server (choose simulator from menu)
pnpm ios          # Open iOS simulator
pnpm android      # Open Android emulator
pnpm web          # Open web browser
pnpm lint         # ESLint on src/**/*.{ts,tsx} --fix
pnpm format       # Prettier on src/**/*.{ts,tsx,css}
pnpm reset-project  # Runs scripts/reset-project.js
```

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- pnpm 11+ (`npm install -g pnpm`)
- Xcode (for iOS simulator) or Android Studio (for Android emulator)
- Expo CLI: `pnpm add -g expo-cli` (optional — `npx expo` also works)
- A [Neon](https://neon.tech) account (free tier available)
- An [Upstash](https://upstash.com) account (free tier available)
- A [Stripe](https://stripe.com) account (test mode)
- An [UploadThing](https://uploadthing.com) account (free tier available)
- Optional: [Google Cloud](https://console.cloud.google.com) API key with Maps SDK enabled (Android only)

### Step-by-Step Installation

```bash
# 1. Clone
git clone <repo-url>
cd CheezOClock

# 2. Install all workspace dependencies
pnpm install

# 3. Set up API environment
cp apps/api/.env.example apps/api/.env
# Fill in: DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY,
#           STRIPE_WEBHOOK_SECRET, UPSTASH_REDIS_REST_URL,
#           UPSTASH_REDIS_REST_TOKEN, UPLOADTHING_TOKEN

# 4. Set up mobile environment
cp apps/mobile/.env.example apps/mobile/.env
# Fill in: EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SERVER_URL,
#           EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, GOOGLE_MAPS_API_KEY

# 5. Push database schema to Neon
cd apps/api
pnpm db:push

# 6. Return to root and start development
cd ../..
pnpm dev   # starts API on :3000 and Expo on iOS simulator

# Optional: Stripe webhook forwarding (separate terminal)
stripe listen --forward-to localhost:3000/api/payments/webhook
# Copy the printed whsec_xxx into STRIPE_WEBHOOK_SECRET in apps/api/.env
```

### Local Development

The API runs at `http://localhost:3000` with all routes prefixed as `/api`.

For GPS tracking and maps features, a **development build** is required (not Expo Go):
```bash
# iOS
cd apps/mobile && npx expo run:ios

# Android
cd apps/mobile && npx expo run:android
```

---

## Source Code Organization

### Dependency Injection Pattern (API)

The API uses the NestJS `@Inject('DB')` token pattern. The `DbModule` is marked `@Global()`, so any service can inject the Drizzle client without importing `DbModule`:

```ts
@Injectable()
export class SomeService {
  constructor(
    @Inject('DB') private db: NeonHttpDatabase<typeof schema>,
    private cacheService: CacheService,
  ) {}
}
```

`CacheModule` is also global (set globally in `app.module.ts`), so `CacheService` is available throughout without re-importing the module.

### DTO Validation

All API endpoints use `class-validator` decorators on DTO classes. The global `ValidationPipe` with `whitelist: true` strips unknown fields and `forbidNonWhitelisted: true` throws on unexpected fields.

### Import Alias (Mobile)

The mobile app uses `@/*` to reference `src/*`:
```ts
import { api } from '@/lib/axios';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@food-delivery/types';
```

All mobile imports use `@/` for internal files and named package imports for workspace packages.

---

## Data Flow

### Customer Places Order

```
1. Customer browses restaurants (GET /restaurants, cached in Redis)
2. Opens restaurant (GET /restaurants/:id)
3. Loads menu (GET /menu/categories/:id + GET /menu/items/:id, cached)
4. Adds items to cart (Zustand store)
5. Opens cart, enters delivery address
6. Taps "Place Order"
   → POST /api/orders → creates order (PENDING) + order_items
   → Navigate to /order/:id
7. Taps "Pay"
   → POST /api/payments/intent → Stripe creates PaymentIntent → returns clientSecret
   → initPaymentSheet + presentPaymentSheet (Stripe UI)
   → User confirms payment in Stripe sheet
8. Stripe webhook fires (POST /api/payments/webhook)
   → Verifies signature
   → Finds order by stripePaymentIntentId
   → Sets status CONFIRMED
   → ordersGateway.emitOrderUpdate() → order:updated to customer room
9. Customer sees live status updates via WebSocket
```

### Driver Delivery Flow

```
1. Driver toggles online (PATCH /api/driver/online)
2. Driver home screen connects Socket.IO, emits join:driver
3. Restaurant owner marks order READY (PATCH /api/orders/:id/status)
   → DriverService.assignDriver() called
   → First online driver found in DB
   → Order updated with driverId
   → emitDriverAssigned() → driver:assigned event to driver room
4. Driver sees incoming order modal
5. Driver accepts → PATCH /api/orders/:id/status { status: PICKED_UP }
6. DriverActiveScreen starts GPS
   → Location.watchPositionAsync (3s interval, 10m distance)
   → socket.emit('driver:location', { driverId, orderId, lat, lng })
   → Server stores in Redis + forwards to order room
7. Customer sees driver on map (useDriverLocationSocket + MapView)
8. Driver taps "Mark Delivered" → PATCH /api/orders/:id/status { status: DELIVERED }
   → WebSocket notifies customer
9. RatingModal appears on customer screen 1.2s after DELIVERED status
```

---

## Shared Types (`packages/types`)

File: [packages/types/index.ts](packages/types/index.ts)

```typescript
// Enums (const objects + type union pattern)
UserRole: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DRIVER'
OrderStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED'

// Core interfaces
User { id, email, firstName, lastName, role, createdAt }
JwtPayload { sub, email, role }
HealthCheckResponse { status, timestamp }
RestaurantType { id, ownerId, name, description, imageUrl, address, cuisineType, isOpen, rating, createdAt, updatedAt }
MenuCategory { id, restaurantId, name, createdAt }
MenuItem { id, categoryId, restaurantId, name, description, price, imageUrl, isAvailable, createdAt, updatedAt }
RestaurantWithMenu { restaurant, categories, items }
CartItem { id, name, price, imageUrl, restaurantId, restaurantName, quantity }
Order { id, customerId, restaurantId, driverId, status, totalAmount, deliveryAddress, stripePaymentIntentId, createdAt, updatedAt }
OrderItem { id, orderId, menuItemId, quantity, unitPrice, createdAt }
```

**Important distinctions:**
- `rating` on `RestaurantType` is `string` (numeric from Postgres is returned as string)
- `price` on `MenuItem` and `CartItem` is `string`
- `totalAmount` on `Order` is `string`
- All prices are strings from the DB; parse with `parseFloat()` before arithmetic

---

## Internal Conventions

### Coding Style

- **No unnecessary comments** — code is self-documenting; comments exist only for non-obvious business logic
- **Defensive security** — total price calculated server-side, price snapshot stored at order time, role checks in services not just controllers
- **Idiomatic Drizzle** — destructure first element: `const [row] = await db.select()...`
- **NestJS guard composition** — `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` applied per endpoint or controller class
- **React Query as primary data layer** — no useEffect for data fetching; mutations use `useMutation`
- **void operator for floating promises** — `void handleLogin()`, `void queryClient.invalidateQueries()`

### File Naming

- API: `kebab-case.ts` for all files; modules follow `feature.controller.ts`, `feature.service.ts`, `feature.module.ts`
- API DTOs: `create-feature.dto.ts`, `update-feature.dto.ts`
- Mobile: `kebab-case.tsx` for components, `kebab-case.ts` for utilities
- Mobile screens: Expo Router convention — `index.tsx` for default screen, `[id].tsx` for dynamic routes

### Import Patterns

**API services import DB:**
```ts
import * as schema from '../db/schema';
// Then use schema.tableName in queries
```

**Mobile imports:**
```ts
import { api } from '@/lib/axios';           // HTTP client
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@food-delivery/types';  // shared types
import { useCartStore } from '@/store/cart-store';
```

### Type Conventions

- Use `as const` pattern for enum-like objects to enable both value and type usage
- `@Inject('DB')` string token for database injection (not class-based)
- `AuthRequest = ExpressRequest & { user: JwtPayload }` type alias repeated in each controller file (no shared auth request type file)

---

## Customization Guide

### Rebranding as a Different Product

This is the primary use case for customization. Changes needed in order of priority:

#### 1. App Name and Identity

| What | File | Field |
|---|---|---|
| App display name | [apps/mobile/app.config.ts:3](apps/mobile/app.config.ts) | `expo.name` |
| URL slug | [apps/mobile/app.config.ts:4](apps/mobile/app.config.ts) | `expo.slug` |
| Deep link scheme | [apps/mobile/app.config.ts:6](apps/mobile/app.config.ts) | `expo.scheme` |
| Apple Pay merchant ID | [apps/mobile/app.config.ts:47](apps/mobile/app.config.ts) | `merchantIdentifier` |
| Package name (iOS) | app.config.ts | add `ios.bundleIdentifier` |
| Package name (Android) | app.config.ts | add `android.package` |

#### 2. Colors and Theme

Primary brand color (`#FF6B35`) is hardcoded in StyleSheet objects throughout screens. To change:

| File | Usage |
|---|---|
| [apps/mobile/src/constants/theme.ts](apps/mobile/src/constants/theme.ts) | Spacing, Fonts, Colors (light/dark) — extend this if you centralize colors |
| [apps/mobile/app.config.ts:40](apps/mobile/app.config.ts) | Splash screen background color: `#208AEF` |
| All `*.tsx` screen files | Inline `backgroundColor: '#FF6B35'` must be replaced manually |

The accent color `#FF6B35` appears in:
- Button backgrounds
- Star ratings
- Category names in restaurant detail
- Input/cart elements
- Activity indicators

**Recommendation:** Create a `Colors.brand` key in `theme.ts` and replace all `#FF6B35` references with `Colors.brand`.

#### 3. Location Permission Strings

File: [apps/mobile/app.config.ts:53-58](apps/mobile/app.config.ts)
```ts
locationWhenInUsePermission: 'Allow Food Delivery to use your location...'
locationAlwaysPermission: 'Allow Food Delivery to track your location...'
```

#### 4. Copy and Labels

| Screen | What to change |
|---|---|
| [apps/mobile/src/app/(customer)/(tabs)/(home)/index.tsx:37](apps/mobile/src/app/(customer)/(tabs)/(home)/index.tsx) | "What are you craving?" heading |
| [apps/mobile/src/app/login.tsx:35](apps/mobile/src/app/login.tsx) | "Welcome back" title |
| All screen headings | Inline `Text` strings |
| [apps/mobile/src/app/_layout.tsx:48](apps/mobile/src/app/_layout.tsx) | Payment sheet merchant display name: "Food Delivery" |

#### 5. Assets

| Asset | File | Where used |
|---|---|---|
| App icon (iOS) | [assets/expo.icon/](apps/mobile/assets/expo.icon/) | iOS home screen |
| App icon (Android) | [assets/images/android-icon-*.png](apps/mobile/assets/images/) | Android adaptive icon |
| Splash icon | [assets/images/splash-icon.png](apps/mobile/assets/images/splash-icon.png) | Splash screen |
| Favicon | [assets/images/favicon.png](apps/mobile/assets/images/favicon.png) | Web |
| Logo glow | [assets/images/logo-glow.png](apps/mobile/assets/images/logo-glow.png) | Animated splash overlay |

#### 6. API URL and Backend Services

| Variable | File |
|---|---|
| API base URL | `apps/mobile/.env` → `EXPO_PUBLIC_API_URL` |
| Socket.IO URL | `apps/mobile/.env` → `EXPO_PUBLIC_SERVER_URL` |
| Stripe key | `apps/mobile/.env` → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Database | `apps/api/.env` → `DATABASE_URL` |

#### 7. Navigation Structure

The role-based route groups are defined in [apps/mobile/src/app/_layout.tsx](apps/mobile/src/app/_layout.tsx). To add or rename roles, update both:
- The `UserRole` const in [packages/types/index.ts](packages/types/index.ts)
- The `userRoleEnum` in [apps/api/src/db/schema/users.ts](apps/api/src/db/schema/users.ts)
- The `Stack.Protected` guards in `_layout.tsx`
- The redirect logic in [apps/mobile/src/app/index.tsx](apps/mobile/src/app/index.tsx)

#### 8. Business Logic Changes

| Change | File |
|---|---|
| Driver assignment strategy | [apps/api/src/driver/driver.service.ts:42](apps/api/src/driver/driver.service.ts) — currently picks first online driver |
| Order state transitions | [apps/api/src/orders/orders.service.ts:187](apps/api/src/orders/orders.service.ts) — `validateTransition()` |
| Cache TTL | [apps/api/src/restaurants/restaurants.service.ts:105](apps/api/src/restaurants/restaurants.service.ts) — `300` seconds |
| GPS update interval | [apps/mobile/src/app/(driver)/active.tsx:72](apps/mobile/src/app/(driver)/active.tsx) — `timeInterval: 3000, distanceInterval: 10` |
| Review auto-show delay | [apps/mobile/src/app/(customer)/order/[id].tsx:89](apps/mobile/src/app/(customer)/order/[id].tsx) — `setTimeout(…, 1200)` |

---

## AI Agent Instructions

### Project Philosophy

This codebase is a **teaching project** that prioritizes clarity over complexity. Every feature is implemented with the minimal amount of abstraction needed to make it work. There are no custom interceptors, no pipes beyond the global ValidationPipe, no complex middleware chains.

### Architecture Invariants (Do Not Break)

1. **`@food-delivery/types` is the single contract between API and mobile.** Any type change must be reflected in both `packages/types/index.ts` and both consumers.

2. **The `'DB'` injection token is global.** `DbModule` is `@Global()`. Any new service needing database access adds `@Inject('DB') private db: NeonHttpDatabase<typeof schema>` — do not re-import DbModule.

3. **`CacheService` is globally available.** It's provided through `CacheModule` (imported in `app.module.ts`). Just inject it in service constructors.

4. **Prices are never trusted from the client.** `OrdersService.create()` recalculates `total` from database menu item prices. Do not change this pattern.

5. **Order status transitions are role-gated.** The state machine in `validateTransition()` must be respected. Only restaurant owners and drivers can change status, and only along permitted paths.

6. **JWT payload is `{ sub, email, role }`.** The `sub` field is the user UUID. All service methods receive `userId = req.user.sub`.

7. **Socket.IO namespace is `/orders`.** Both server (`@WebSocketGateway`) and client (`io(…/orders)`) must agree on this namespace. Do not change it without updating both.

8. **Upstash Redis is used for two purposes.** `CacheService` and `LocationService` both instantiate their own `Redis` client. They share the same Upstash instance but maintain separate key namespaces.

### Safe Places to Add Features

- **New API module**: Create `src/feature/feature.module.ts`, `.controller.ts`, `.service.ts` following existing patterns; import module in `app.module.ts`.
- **New screen (mobile)**: Add file under appropriate role group in `src/app/`; Expo Router picks it up automatically.
- **New shared type**: Add to `packages/types/index.ts`.
- **New cache key**: Add to `apps/api/src/cache/cache-keys.ts`.

### Things to Verify Before Modifying

- **Schema changes**: After modifying any file in `apps/api/src/db/schema/`, run `pnpm db:push` from `apps/api/` to apply to Neon.
- **Shared type changes**: Verify the type compiles in both `apps/api` and `apps/mobile` — they use slightly different TypeScript configs.
- **New route in API**: All routes need `@UseGuards(JwtAuthGuard)` minimum. Add `@UseGuards(RolesGuard)` + `@Roles()` for role restriction.
- **New screen in mobile**: Ensure it's in the correct route group. Screens in `(customer)/` are only accessible to `CUSTOMER` role users.

### Common Mistakes to Avoid

1. **Do not import `DbModule` in feature modules.** It's already global.
2. **Do not use `localhost` in mobile env for physical device testing.** Use LAN IP.
3. **Do not use Expo Go for GPS/Maps features.** They require a development build.
4. **Do not forget to invalidate Redis cache** after mutations that affect cached data (restaurants list, menu categories, menu items).
5. **Do not add prices from the client** to order totals — always recalculate from DB.
6. **`rating` and `price` fields from DB are strings**, not numbers. Parse with `parseFloat()` before arithmetic.
7. **The mobile `uploadthing.ts` has a relative import** into the API source tree. If the API's upload-router moves, this breaks.
8. **Socket singleton pattern in `use-order-socket.ts`**: the `socket` variable is module-level. Multiple hook instances share the same connection. This is intentional.

### Naming Conventions

- **API feature modules**: `PascalCase` for classes, `camelCase` for files (e.g., `RestaurantsService` in `restaurants.service.ts`)
- **Mobile components**: `PascalCase` for component functions, `kebab-case` for files (e.g., `RatingModal` in `rating-modal.tsx`)
- **Mobile hooks**: `use-` prefix, `kebab-case` file name
- **Mobile screens**: default export, file name matches route

---

## Developer Notes

### Running Stripe Webhooks Locally

Stripe webhooks cannot reach `localhost` from Stripe's servers. Use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```
The CLI prints a `whsec_xxx` signing secret. Set this as `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`. This must be running during development whenever you test the payment flow.

### Database Workflow

This project uses **push-based migrations** (not migration files). The Drizzle Kit `db:push` command introspects the current schema and applies changes directly:
```bash
cd apps/api
pnpm db:push
```
This is appropriate for development but for production you should consider switching to `drizzle-kit generate` + `drizzle-kit migrate`.

### TypeScript Module Resolution

The API uses `module: "nodenext"` and `moduleResolution: "nodenext"`. This means ESM-style imports and exports. The `@food-delivery/types` package has `"type": "module"` and `"main": "index.ts"` — TypeScript resolves it directly from source.

### pnpm `allowBuilds`

The `pnpm-workspace.yaml` has `allowBuilds` for native dependencies:
```yaml
allowBuilds:
  '@nestjs/core': true
  bcrypt: true
  esbuild: true
  msgpackr-extract: true
  unrs-resolver: true
```
These packages have native Node.js addons that need to compile during install. If you add a new native dep, add it here.

### Expo Router Experimental Features

The mobile app has two experimental Expo Router features enabled:
- `typedRoutes: true` — routes are typed, enabling autocomplete on `router.push()`
- `reactCompiler: true` — React 19 compiler optimizations

These are stable enough for development but may have edge cases.

---

## Common Pitfalls

| Pitfall | Root cause | Fix |
|---|---|---|
| `"Cannot transition from X to Y"` | Invalid status update attempt | Follow state machine transitions table |
| `"You already have a restaurant"` | Owner trying to create second restaurant | One owner = one restaurant enforced |
| Payment not confirming | Stripe webhook not running | Start `stripe listen --forward-to ...` |
| Map not showing | Using Expo Go instead of dev build | Run `npx expo run:ios` or `run:android` |
| GPS not updating | Location permission denied | Check device permissions |
| `404 Not Found` on driver location | Order status not PICKED_UP | Map only renders when `status === 'PICKED_UP'` |
| Cart cleared unexpectedly | Items from different restaurant added | Expected behavior; user must confirm |
| TypeScript errors in types package | Shared type change not propagated | Update `packages/types/index.ts` |
| `"Invalid webhook signature"` | Wrong `STRIPE_WEBHOOK_SECRET` | Copy exact secret from `stripe listen` output |
| `"Email already in use"` | Duplicate registration attempt | 409 ConflictException from AuthService |

---

## Glossary

| Term | Definition |
|---|---|
| **NativeTabs** | `expo-router/unstable-native-tabs` — uses the platform's native tab bar (UITabBarController on iOS) |
| **RBAC** | Role-Based Access Control — enforced via `@Roles()` + `RolesGuard` |
| **Cache-aside** | Pattern where cache is checked first; on miss, DB is queried and result cached |
| **Payment Sheet** | Stripe's pre-built native payment UI shown via `presentPaymentSheet()` |
| **Payment Intent** | Stripe object representing a payment; created server-side, completed client-side |
| **Webhook** | Stripe HTTP callback to `/api/payments/webhook` confirming payment success |
| **WS room** | Socket.IO concept — named group; clients join rooms and receive targeted events |
| **TTL** | Time-to-live — how long a Redis key lives before auto-expiry |
| **Upstash** | Serverless Redis provider with REST API (no persistent TCP connection needed) |
| **Neon** | Serverless Postgres provider used as the primary database |
| **UploadThing** | Managed file upload service; handles S3 bucket, CDN, and auth |
| **Drizzle** | TypeScript-first ORM generating SQL from schema definitions |
| **Drizzle Kit** | CLI companion to Drizzle ORM; handles schema push and database inspection |
| **Expo Router** | File-based router for Expo apps (similar to Next.js App Router) |
| **`workspace:*`** | pnpm dependency specifier meaning "use the workspace version of this package" |
| **`@Inject('DB')`** | NestJS custom injection token for the Drizzle database instance |
| **dev build** | Expo build that includes native modules not available in Expo Go |

---

## Summary

This is a complete, production-pattern food delivery application with three user roles, real-time WebSocket communication, Stripe payments, GPS tracking, Redis caching, and image uploads — all in a pnpm monorepo sharing TypeScript types across API and mobile.

**Key files a new contributor should read first:**
1. [packages/types/index.ts](packages/types/index.ts) — all shared contracts
2. [apps/api/src/app.module.ts](apps/api/src/app.module.ts) — module wiring
3. [apps/api/src/orders/orders.service.ts](apps/api/src/orders/orders.service.ts) — core business logic
4. [apps/api/src/gateway/orders.gateway.ts](apps/api/src/gateway/orders.gateway.ts) — real-time protocol
5. [apps/mobile/src/app/_layout.tsx](apps/mobile/src/app/_layout.tsx) — app providers + role routing
6. [apps/mobile/src/context/auth-context.tsx](apps/mobile/src/context/auth-context.tsx) — auth state
7. [apps/mobile/src/store/cart-store.ts](apps/mobile/src/store/cart-store.ts) — cart state
8. [apps/mobile/src/hooks/use-order-socket.ts](apps/mobile/src/hooks/use-order-socket.ts) — WebSocket hooks

**For customization/rebranding:** start with [apps/mobile/app.config.ts](apps/mobile/app.config.ts), [apps/mobile/src/constants/theme.ts](apps/mobile/src/constants/theme.ts), and replace all `#FF6B35` color references.
