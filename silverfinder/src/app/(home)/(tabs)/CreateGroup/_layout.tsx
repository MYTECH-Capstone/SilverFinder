// app/(tabs)/CreateGroup/_layout.tsx
import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}
    />
  );
}
