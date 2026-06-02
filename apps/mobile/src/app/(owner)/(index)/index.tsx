import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '@/lib/axios';
import { RestaurantType } from '@food-delivery/types';

export default function OwnerHomeScreen() {
  const queryClient = useQueryClient();

  const {
    data: restaurant,
    isLoading,
    isFetching,
  } = useQuery<RestaurantType | null>({
    queryKey: ['my-restaurant'],
    queryFn: () =>
      api
        .get<RestaurantType | null>('/restaurants/mine')
        .then((res) => res.data),
  });

  const { mutate: toggleOpen } = useMutation({
    mutationFn: () =>
      api.patch(`/restaurants/${restaurant?.id}`, {
        isOpen: !restaurant?.isOpen,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['my-restaurant'] }),
  });

  useEffect(() => {
    if (isLoading) return;
    if (!restaurant) {
      router.replace('/(owner)/(index)/create-restaurant');
    }
  }, [restaurant, isLoading, isFetching]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{restaurant?.name}</Text>

      <Pressable
        style={[
          styles.toggleButton,
          restaurant?.isOpen ? styles.open : styles.closed,
        ]}
        onPress={() => {
          toggleOpen();
        }}
      >
        <Text style={styles.toggleText}>
          {restaurant?.isOpen ? 'Open — tap to close' : 'Closed — tap to open'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.editButton}
        onPress={() => router.push('/(owner)/(index)/edit-restaurant')}
      >
        <Text style={styles.editButtonText}>Edit Restaurant</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  toggleButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 15,
  },
  editButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
