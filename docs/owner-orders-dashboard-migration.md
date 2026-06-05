# Owner Orders Dashboard — Old → New Migration Guide

**File:** `apps/mobile/src/app/(owner)/(index)/index.tsx`  
**Goal:** Turn the simple owner home screen into an orders dashboard with status actions.  
**Prerequisite:** Episode 10 API (`GET /orders/restaurant`, `PATCH /orders/:id/status`) is already in place.

---

## Before vs After

| Old | New |
|-----|-----|
| Restaurant name + open toggle + edit button only | Same header + scrollable order list |
| Centered layout | Full-width, top-aligned layout |
| No orders | Fetches restaurant orders, polls every 10s |
| No status actions | **Start Preparing** / **Mark Ready** buttons |
| Shows all non-terminal orders | Shows only paid/active orders (no `PENDING`) |

---

## Step 1 — Update imports

**Replace** the react-native import block:

```ts
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
```

**With:**

```ts
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
```

**Add** safe area:

```ts
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
```

**Add** `Order` to types import:

```ts
import { Order, RestaurantType } from '@food-delivery/types';
```

---

## Step 2 — Add status colors constant

**Above** the component, add:

```ts
const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#3B82F6',
  PREPARING: '#F59E0B',
  READY: '#10B981',
  PICKED_UP: '#8B5CF6',
  DELIVERED: '#6B7280',
  CANCELLED: '#EF4444',
};

const TAB_BAR_OFFSET = 88;
```

---

## Step 3 — Add safe area hook

**Inside** `OwnerHomeScreen`, after `useQueryClient()`:

```ts
const insets = useSafeAreaInsets();
```

---

## Step 4 — Fetch restaurant orders

**After** the `restaurant` query, add:

```ts
const {
  data: orders = [],
  refetch,
  isRefetching,
} = useQuery<Order[]>({
  queryKey: ['restaurant-orders'],
  queryFn: () => api.get<Order[]>('/orders/restaurant').then((r) => r.data),
  enabled: !!restaurant,
  refetchInterval: 10000,
});
```

---

## Step 5 — Add update-status mutation

**After** `toggleOpen` mutation, add:

```ts
const { mutate: updateStatus } = useMutation({
  mutationFn: ({ id, status }: { id: string; status: string }) =>
    api.patch(`/orders/${id}/status`, { status }),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] }),
  onError: (e: any) =>
    Alert.alert(
      'Error',
      e?.response?.data?.message ?? 'Could not update status',
    ),
});
```

---

## Step 6 — Filter active and past orders

**After** the loading check, **before** `return`, add:

```ts
const activeOrders = orders.filter((o) =>
  ['CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'].includes(o.status),
);

const pastOrders = orders.filter((o) =>
  ['DELIVERED', 'CANCELLED'].includes(o.status),
);
```

> **Why no `PENDING`?** Unpaid orders. Owner only acts after Stripe confirms payment (`CONFIRMED`).

---

## Step 7 — Add action button helper

**Before** `return`, add:

```ts
function renderActionButton(order: Order) {
  if (order.status === 'CONFIRMED') {
    return (
      <Pressable
        style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
        onPress={() => updateStatus({ id: order.id, status: 'PREPARING' })}
      >
        <Text style={styles.actionButtonText}>Start Preparing</Text>
      </Pressable>
    );
  }
  if (order.status === 'PREPARING') {
    return (
      <Pressable
        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
        onPress={() => updateStatus({ id: order.id, status: 'READY' })}
      >
        <Text style={styles.actionButtonText}>Mark Ready</Text>
      </Pressable>
    );
  }
  return null;
}
```

---

## Step 8 — Replace the return JSX

**Delete** the old centered `<View style={styles.container}>` return.

**Replace with:**

```tsx
return (
  <SafeAreaView style={styles.container} edges={['top']}>
    <View style={styles.topSection}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant?.name}
        </Text>

        <Pressable
          style={[
            styles.toggleButton,
            restaurant?.isOpen ? styles.open : styles.closed,
          ]}
          onPress={() => toggleOpen()}
        >
          <Text style={styles.toggleText}>
            {restaurant?.isOpen ? 'Open' : 'Closed'}
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.editButton}
        onPress={() => router.push('/(owner)/(index)/edit-restaurant')}
      >
        <Text style={styles.editButtonText}>Edit Restaurant</Text>
      </Pressable>

      <FlatList
        style={styles.list}
        data={activeOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + TAB_BAR_OFFSET },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No active orders</Text>
          </View>
        }
        ListHeaderComponent={
          activeOrders.length > 0 ? (
            <Text style={styles.sectionTitle}>
              Active Orders ({activeOrders.length})
            </Text>
          ) : null
        }
        ListFooterComponent={
          pastOrders.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>Past Orders</Text>
              {pastOrders.slice(0, 5).map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: STATUS_COLORS[order.status] + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: STATUS_COLORS[order.status] },
                        ]}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderTotal}>${order.totalAmount}</Text>
                  <Text style={styles.orderAddress} numberOfLines={1}>
                    {order.deliveryAddress}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
        renderItem={({ item: order }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>
                #{order.id.slice(0, 8).toUpperCase()}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_COLORS[order.status] + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLORS[order.status] },
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>
            <Text style={styles.orderTotal}>${order.totalAmount}</Text>
            <Text style={styles.orderAddress} numberOfLines={1}>
              {order.deliveryAddress}
            </Text>
            {renderActionButton(order)}
          </View>
        )}
      />
    </View>
  </SafeAreaView>
);
```

---

## Step 9 — Replace the entire StyleSheet

**Delete** the old styles. **Paste:**

```ts
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    flex: 1,
    width: '100%',
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  name: {
    flex: 1,
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  toggleButton: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  open: {
    backgroundColor: '#22C55E',
  },
  closed: {
    backgroundColor: '#EF4444',
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  editButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    marginBottom: 12,
    gap: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
  orderAddress: {
    fontSize: 13,
    color: '#666',
  },
  actionButton: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
```

---

## Step 10 — Test

1. Login as **customer** → place order → pay → status `CONFIRMED`
2. Login as **owner** → Orders tab shows the order (no `PENDING` rows)
3. Tap **Start Preparing** → status `PREPARING`
4. Tap **Mark Ready** → status `READY`
5. Scroll to bottom → last card clears the tab bar
6. Pull down → list refreshes

---

## Quick reference — what each step adds

| Step | Adds |
|------|------|
| 1 | `FlatList`, `Alert`, `RefreshControl`, `SafeAreaView` |
| 2 | Status badge colors |
| 3–4 | Fetch `/orders/restaurant` |
| 5 | Patch `/orders/:id/status` |
| 6 | Filter out `PENDING` — **your new filter** |
| 7 | Owner action buttons |
| 8 | Full dashboard UI |
| 9 | Layout fixes (header row, list flex, tab bar padding) |
| 10 | Manual test checklist |
