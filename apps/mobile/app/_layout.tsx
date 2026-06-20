import { Stack } from 'expo-router';
import { AuthProvider } from '../providers/AuthProvider';
// ⚠️  This import MUST stay here — it executes TaskManager.defineTask() at module
// load time, which is required for expo-task-manager to register the background
// location task before any React components render.
import '../tasks/locationTask';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
        <Stack.Screen name="shift/[id]" />
        <Stack.Screen name="recap/[id]" />
      </Stack>
    </AuthProvider>
  );
}
