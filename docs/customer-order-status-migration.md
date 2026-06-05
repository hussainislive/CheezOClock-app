# Customer Order Status Tracker — Old → New Migration Guide

**File:** `apps/mobile/src/app/(customer)/order/[id].tsx`  
**Goal:** Add live order status tracking (Episode 10) on top of the Stripe payment screen (Episode 09).  
**Prerequisite:** Owner can update order status (`PREPARING`, `READY`, etc.) via Episode 10 API.

---

## Before vs After

| Old (Episode 09) | New (Episode 09 + 10) |
|----------------|------------------------|
| Payment + order summary only | Payment **+** status step tracker |
| No polling after payment | Polls every 5s until `DELIVERED` or `CANCELLED` |
| Static status text in card | Visual step tracker (CONFIRMED → DELIVERED) |
| Centered `View` layout | `ScrollView` (longer content scrolls) |
| `router.replace('/(customer)/(tabs)/(home)')` | Same — **keep your tabs path** |

> **Teaching note:** The Episode 10 script `NEW CODE` replaces the whole screen. **Do not delete Stripe.** Merge the tracker into your existing file.

---

## Step 1 — Add `ScrollView` to imports

**Find:**

```ts
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
```

**Change to:**

```ts
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
```

Keep `useState`, `useStripe`, `Alert` — payment still needs them.

---

## Step 2 — Add status tracker constants

**Above** the component, add:

```ts
const STATUS_STEPS = [
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: '✅' },
  { key: 'PREPARING', label: 'Being Prepared', icon: '👨‍🍳' },
  { key: 'READY', label: 'Ready for Pickup', icon: '📦' },
  { key: 'PICKED_UP', label: 'Driver Picked Up', icon: '🛵' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉' },
];

const STATUS_ORDER = [
  'CONFIRMED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'DELIVERED',
];
```

---

## Step 3 — Add polling to `useQuery`

**Find** your query:

```ts
const {
  data: order,
  isLoading,
  refetch,
} = useQuery<Order & { items: any[] }>({
  queryKey: ['order', id],
  queryFn: () =>
    api.get<Order & { items: any[] }>(`/orders/${id}`).then((r) => r.data),
  enabled: !!id,
});
```

**Replace with:**

```ts
const {
  data: order,
  isLoading,
  refetch,
} = useQuery<Order & { items: any[] }>({
  queryKey: ['order', id],
  queryFn: () =>
    api.get<Order & { items: any[] }>(`/orders/${id}`).then((r) => r.data),
  enabled: !!id,
  refetchInterval: (query) => {
    const status = query.state.data?.status;
    return status === 'DELIVERED' || status === 'CANCELLED' ? false : 5000;
  },
});
```

> **React Query v5 fix:** callback receives `query`, not `data`. Script uses `data?.status` — that breaks in v5.

---

## Step 4 — Add `currentIndex` before return

**After** the loading check, **before** the main `return`, add:

```ts
const currentIndex = STATUS_ORDER.indexOf(order?.status ?? '');
```

---

## Step 5 — Swap `View` for `ScrollView`

**Find:**

```tsx
<SafeAreaView style={styles.container} edges={['top']}>
  <View style={styles.content}>
```

**Replace with:**

```tsx
<SafeAreaView style={styles.container} edges={['top']}>
  <ScrollView contentContainerStyle={styles.content}>
```

**Find** the closing `</View>` before `</SafeAreaView>` and change to `</ScrollView>`.

---

## Step 6 — Add status tracker below payment section

**Keep** your existing header (emoji, title, subtitle), card, Pay button, and Back button.

**Insert this block** after the Pay button (or after the card if no Pay button showing) and **before** the Back button:

```tsx
{order?.status === 'CANCELLED' ? (
  <View style={styles.cancelledBox}>
    <Text style={styles.cancelledText}>❌ Order Cancelled</Text>
  </View>
) : order?.status !== 'PENDING' ? (
  <View style={styles.tracker}>
    <Text style={styles.trackerTitle}>Order Progress</Text>
    {STATUS_STEPS.map((step, index) => {
      const isCompleted = index <= currentIndex;
      const isActive = index === currentIndex;
      return (
        <View key={step.key} style={styles.step}>
          <View style={styles.stepLeft}>
            <View
              style={[
                styles.stepCircle,
                isCompleted && styles.stepCircleCompleted,
                isActive && styles.stepCircleActive,
              ]}
            >
              <Text style={styles.stepIcon}>
                {isCompleted ? step.icon : '○'}
              </Text>
            </View>
            {index < STATUS_STEPS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  isCompleted && styles.stepLineCompleted,
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              isActive && styles.stepLabelActive,
              isCompleted && styles.stepLabelCompleted,
            ]}
          >
            {step.label}
          </Text>
        </View>
      );
    })}
  </View>
) : null}
```

> Tracker shows only after payment (`CONFIRMED`+). `PENDING` still shows Pay button only.

---

## Step 7 — Update `content` style

**Find:**

```ts
content: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
},
```

**Replace with:**

```ts
content: {
  padding: 24,
},
```

`ScrollView` should not use `flex: 1` + `justifyContent: 'center'` — content gets cut off.

---

## Step 8 — Add tracker styles

**Add** these to your `StyleSheet` (keep all existing payment styles):

```ts
trackerTitle: {
  fontSize: 16,
  fontWeight: '700',
  marginBottom: 16,
  color: '#333',
},
cancelledBox: {
  backgroundColor: '#FEE2E2',
  borderRadius: 12,
  padding: 20,
  alignItems: 'center',
  marginBottom: 24,
  width: '100%',
},
cancelledText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#EF4444',
},
tracker: {
  marginBottom: 24,
  width: '100%',
},
step: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
},
stepLeft: {
  alignItems: 'center',
},
stepCircle: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#f0f0f0',
  alignItems: 'center',
  justifyContent: 'center',
},
stepCircleCompleted: {
  backgroundColor: '#DCFCE7',
},
stepCircleActive: {
  backgroundColor: '#FF6B35',
},
stepIcon: {
  fontSize: 16,
},
stepLine: {
  width: 2,
  height: 32,
  backgroundColor: '#f0f0f0',
  marginVertical: 2,
},
stepLineCompleted: {
  backgroundColor: '#22C55E',
},
stepLabel: {
  fontSize: 15,
  color: '#999',
  paddingTop: 10,
},
stepLabelActive: {
  color: '#FF6B35',
  fontWeight: '700',
},
stepLabelCompleted: {
  color: '#333',
  fontWeight: '500',
},
```

---

## Step 9 — Keep the correct home route

Script says:

```ts
router.replace('/(customer)/(home)')
```

**Your app uses tabs layout. Keep:**

```ts
router.replace('/(customer)/(tabs)/(home)')
```

Do **not** change this to match the script.

---

## Step 10 — Test the full flow

1. Place order → land on order screen → status `PENDING` → **Pay** button visible, **no tracker**
2. Pay with test card `4242 4242 4242 4242` → status `CONFIRMED` → tracker appears, step 1 highlighted
3. Owner taps **Start Preparing** → customer screen updates within 5s → step 2 active
4. Owner taps **Mark Ready** → step 3 active
5. Scroll works on small screens
6. `DELIVERED` or `CANCELLED` → polling stops

---

## Quick reference — what each step adds

| Step | Adds |
|------|------|
| 1 | `ScrollView` import |
| 2 | `STATUS_STEPS` + `STATUS_ORDER` constants |
| 3 | 5s polling until terminal status |
| 4 | `currentIndex` for active step |
| 5 | Scrollable layout |
| 6 | Visual status tracker UI |
| 7 | Fix content layout for scroll |
| 8 | Tracker + cancelled styles |
| 9 | Correct tabs home path |
| 10 | End-to-end test checklist |

---

## Script vs your codebase — path note

| Script path | Your path |
|-------------|-----------|
| `(customer)/(home)/order/[id].tsx` | `(customer)/order/[id].tsx` |

Same screen, different router tree (Android nav fix from Episode 08). Edit **`(customer)/order/[id].tsx`** only.
