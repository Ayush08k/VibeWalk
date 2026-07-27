/**
 * Notification Service — Contextual Inactivity & Milestone Alerts
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') return false;
    const permResult: any = await Notifications.getPermissionsAsync();
    let finalStatus = permResult?.status || (permResult?.granted ? 'granted' : 'denied');

    if (finalStatus !== 'granted') {
      const reqResult: any = await Notifications.requestPermissionsAsync();
      finalStatus = reqResult?.status || (reqResult?.granted ? 'granted' : 'denied');
    }

    if (finalStatus !== 'granted') {
      console.log('[notificationService] Permission not granted for push notifications.');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'VibeWalk Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00F5FF',
      });
    }

    return true;
  } catch (error) {
    console.warn('[notificationService] Error setting up notifications:', error);
    return false;
  }
}

export async function scheduleInactivityAlert(idleHours: number = 2): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Time for a Cyber Walk Break!',
        body: `You've been sitting for over ${idleHours} hours. Take a quick 5-minute, 500-step walking break to stay in the zone!`,
        sound: true,
        data: { type: 'inactivity_break' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: idleHours * 3600,
        repeats: false,
      },
    });
  } catch (e) {
    console.warn('[notificationService] Failed scheduling inactivity alert:', e);
  }
}

export async function sendMilestoneNotification(steps: number, goal: number): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    const ratio = steps / (goal || 10000);
    let title = '';
    let body = '';

    if (ratio >= 1.0) {
      title = '🏆 GOAL CRUSHED!';
      body = `Boom! You just reached ${steps.toLocaleString()} steps today! You're unstoppable!`;
    } else if (ratio >= 0.75) {
      title = '🔥 Almost There!';
      body = `You're only ${(goal - steps).toLocaleString()} steps away from crushing today's goal! Take a quick walk!`;
    } else if (ratio >= 0.5) {
      title = '⚡ Halfway Benchmark!';
      body = `Great momentum! You reached 50% of your daily goal (${steps.toLocaleString()} steps).`;
    } else return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (e) {
    console.warn('[notificationService] Failed sending milestone notification:', e);
  }
}
