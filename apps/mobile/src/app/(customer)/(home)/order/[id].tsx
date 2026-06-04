import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/axios';
import { Order } from '@food-delivery/types';

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useQuery<Order & { items: any[] }>({
    queryKey: ['order', id],
    queryFn: () =>
      api.get<Order & { items: any[] }>(`/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>Your order has been received</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>
            {order?.id.slice(0, 8).toUpperCase()}
          </Text>

          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>${order?.totalAmount}</Text>

          <Text style={styles.label}>Delivery to</Text>
          <Text style={styles.value}>{order?.deliveryAddress}</Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.statusBadge}>{order?.status}</Text>
        </View>

        <Text style={styles.paymentNote}>Payment coming soon</Text>

        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace('/(customer)/(home)')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    gap: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
  },
  paymentNote: {
    fontSize: 13,
    color: '#999',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  homeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
