import { StyleSheet, Text, View } from 'react-native';

export default function CustomerOrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Customer Orders</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, fontWeight: '700' },
});
