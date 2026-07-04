/**
 * tasks/locationTask.ts
 *
 * Background location task for Kruto Tastes.
 *
 * When a worker clocks in, we start a background location task registered
 * with expo-task-manager. The OS wakes the task periodically (every ~30s
 * while the app is in the background, subject to OS throttling) and we:
 *   1. Compare the worker's current position against the store geofence.
 *   2. If they've been outside for >= 15 minutes cumulative, we POST a
 *      BREAK_START action to the server.
 *   3. If they return inside while on auto-break, we POST BREAK_END.
 *
 * The task reads the auth token from SecureStore (using AFTER_FIRST_UNLOCK
 * keychain accessibility) and the active assignment info from AsyncStorage
 * so it can operate without any React state.
 */

import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "../utils/tokenManager";
import { Alert, Linking } from "react-native";

export const BACKGROUND_LOCATION_TASK = "kruto-background-location";

// Geofence break threshold: 15 minutes continuous outside the store
const BREAK_THRESHOLD_SECS = 15 * 60;

// Keys written to AsyncStorage so the background task can access shift data
export const ASYNC_STORE_ASSIGNMENT_KEY = "kruto_active_assignment";
export const ASYNC_STORE_OUTSIDE_SECS_KEY = "kruto_outside_secs";
export const ASYNC_STORE_ON_AUTO_BREAK_KEY = "kruto_on_auto_break";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Register the task definition — this MUST be called at the top level
// (i.e. at module import time, before any async work)
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error("[BG Location Task] error:", error.message);
    return;
  }

  const locations = data?.locations as Location.LocationObject[] | undefined;
  if (!locations || locations.length === 0) return;

  const loc = locations[locations.length - 1]; // most recent fix

  try {
    // Read active assignment from AsyncStorage
    const assignmentJson = await AsyncStorage.getItem(ASYNC_STORE_ASSIGNMENT_KEY);
    if (!assignmentJson) return; // no active clocked-in shift

    const assignment = JSON.parse(assignmentJson);
    const { id: assignmentId, store } = assignment;

    if (!store?.latitude || !store?.longitude || !store?.radius) return;

    const dist = haversineDistance(
      loc.coords.latitude,
      loc.coords.longitude,
      store.latitude,
      store.longitude
    );
    const isOutside = dist > store.radius;

    // Read cumulative counters
    const outsideSecsStr = await AsyncStorage.getItem(ASYNC_STORE_OUTSIDE_SECS_KEY);
    const onAutoBreakStr = await AsyncStorage.getItem(ASYNC_STORE_ON_AUTO_BREAK_KEY);
    let outsideSecs = outsideSecsStr ? parseFloat(outsideSecsStr) : 0;
    const onAutoBreak = onAutoBreakStr === "true";

    const token = await getToken();
    if (!token) return;

    const API_BASE_URL =
      process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://krut-6zbd.vercel.app/api";

    // Fire-and-forget in/out status to server (foundation for admin live-location view)
    fetch(`${API_BASE_URL}/location/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-app-client": "mobile-app" },
      body: JSON.stringify({ inStore: !isOutside }),
    }).catch(() => {});

    if (isOutside) {
      // First tick outside — notify worker that break timer will start in 15 min
      if (outsideSecs === 0) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "You've left the store",
            body: `Break timer will start in 15 minutes if you don't return to ${store.name || "your store"}.`,
            sound: true,
          },
          trigger: null, // fire immediately
        }).catch(() => {});
      }

      // Assume ~30s between location updates (OS delivers best-effort)
      outsideSecs += 30;
      await AsyncStorage.setItem(ASYNC_STORE_OUTSIDE_SECS_KEY, String(outsideSecs));

      if (outsideSecs >= BREAK_THRESHOLD_SECS && !onAutoBreak) {
        // Auto-start break
        const res = await fetch(`${API_BASE_URL}/timeclock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-app-client": "mobile-app",
          },
          body: JSON.stringify({ action: "BREAK_START", assignmentId }),
        });
        if (res.ok) {
          await AsyncStorage.setItem(ASYNC_STORE_ON_AUTO_BREAK_KEY, "true");
          // Notify worker that break has started
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Break time started",
              body: "Break time is now being recorded.",
              sound: true,
            },
            trigger: null,
          }).catch(() => {});
        }
      }
    } else {
      // Back inside the store
      outsideSecs = 0;
      await AsyncStorage.setItem(ASYNC_STORE_OUTSIDE_SECS_KEY, "0");

      if (onAutoBreak) {
        // Auto-end break
        const res = await fetch(`${API_BASE_URL}/timeclock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-app-client": "mobile-app",
          },
          body: JSON.stringify({ action: "BREAK_END", assignmentId }),
        });
        if (res.ok) {
          await AsyncStorage.setItem(ASYNC_STORE_ON_AUTO_BREAK_KEY, "false");
          // Notify worker that break timer stopped
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Break timer stopped",
              body: `Welcome back at ${store.name || "the store"}.`,
              sound: true,
            },
            trigger: null,
          }).catch(() => {});
        }
      }
    }
  } catch (e) {
    console.error("[BG Location Task] unexpected error:", e);
  }
});

/**
 * startBackgroundLocationTracking()
 *
 * Starts the background location task.  Call this when the worker clocks in.
 * Saves the active assignment info to AsyncStorage so the task can reference it.
export async function startBackgroundLocationTracking(assignment: {
  id: string;
  store: { latitude: number; longitude: number; radius: number } | null;
}) {
  try {
    // Show prominent disclosure to user before requesting OS permission
    const userAgreed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Location Access in Background Required",
        "Kruto Tastes collects location data in the background to verify you are at your assigned store during active shifts and automatically manage break times when you enter or leave the venue.\n\nTo enable this feature, please choose 'Allow Always' in the next prompt.",
        [
          { text: "No, Thank You", style: "cancel", onPress: () => resolve(false) },
          { text: "Accept & Continue", onPress: () => resolve(true) }
        ],
        { cancelable: false }
      );
    });

    if (!userAgreed) {
      console.warn("[BG Location] User declined background location prominent disclosure.");
      return false;
    }

    // Request "always" permission — the user will see the iOS prompt
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("[BG Location] Background permission not granted — falling back to foreground polling");
      return false;
    }

    // Persist assignment info for the task
    await AsyncStorage.setItem(ASYNC_STORE_ASSIGNMENT_KEY, JSON.stringify(assignment));
    await AsyncStorage.setItem(ASYNC_STORE_OUTSIDE_SECS_KEY, "0");
    await AsyncStorage.setItem(ASYNC_STORE_ON_AUTO_BREAK_KEY, "false");

    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
    if (!isRunning) {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30_000,       // 30 seconds minimum interval
        distanceInterval: 20,       // or every 20 metres moved
        showsBackgroundLocationIndicator: true,  // iOS blue bar
        foregroundService: {
          notificationTitle: "Kruto Tastes — Shift Active",
          notificationBody: "Tracking your location while you are clocked in.",
          notificationColor: "#6366F1",
        },
        deferredUpdatesInterval: 30_000,
        deferredUpdatesDistance: 20,
        pausesUpdatesAutomatically: false,
      });
    }

    return true;
  } catch (e) {
    console.error("[BG Location] Failed to start:", e);
    return false;
  }
}

/**
 * stopBackgroundLocationTracking()
 *
 * Stops the background task and clears persisted assignment data.
 * Call this when the worker clocks out or signs out.
 */
export async function stopBackgroundLocationTracking() {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  } catch (e) {
    console.error("[BG Location] Failed to stop:", e);
  }
  // Clear persisted data regardless
  await AsyncStorage.multiRemove([
    ASYNC_STORE_ASSIGNMENT_KEY,
    ASYNC_STORE_OUTSIDE_SECS_KEY,
    ASYNC_STORE_ON_AUTO_BREAK_KEY,
  ]);
}
