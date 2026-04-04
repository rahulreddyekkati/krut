import { Stack } from 'expo-router';
import { AuthProvider } from '../providers/AuthProvider';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
