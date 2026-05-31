import { StyleSheet, Text, View } from 'react-native';

export default function OwnerAnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Owner Analytics</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, fontWeight: '700' },
});
