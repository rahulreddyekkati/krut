import { Stack } from 'expo-router';
import { AuthProvider } from '../providers/AuthProvider';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="messages" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
        <Stack.Screen name="shift/[id]" />
        <Stack.Screen name="recap/[id]" />
      </Stack>
    </AuthProvider>
  );
}
