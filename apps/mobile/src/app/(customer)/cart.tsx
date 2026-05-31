import { StyleSheet, Text, View } from 'react-native';

export default function CustomerCartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Customer Cart</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, fontWeight: '700' },
});
