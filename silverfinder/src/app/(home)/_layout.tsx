//Where we will define our home layout screens
// USER IS FOR SURE AUTH HERE

import { Slot, Stack, Redirect } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
export default function HomeLayout() {
  const { user } = useAuth();
  if(!user){
    return <Redirect href="/(auth)/login" />;
  }
  return <Stack>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  </Stack>;
}
