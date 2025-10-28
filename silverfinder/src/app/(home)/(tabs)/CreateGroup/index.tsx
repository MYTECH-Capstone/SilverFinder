// app/(tabs)/CreateGroup/index.tsx
import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function GroupsHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groups</Text>
      <Button title="Create a Group" onPress={() => router.push('/CreateGroup/Create')} />
      <View style={{ height: 12 }} />
      <Button title="Join a Group" onPress={() => router.push('/CreateGroup/Join')} />
      <Button title="View My Groups" onPress={() => router.push('/(home)/(tabs)/CreateGroup/MyGroups')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
