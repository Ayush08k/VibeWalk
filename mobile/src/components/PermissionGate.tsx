import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, AppState, AppStateStatus, StyleSheet } from 'react-native';
import PermissionScreen from '../screens/PermissionScreen';
import { checkStepPermission } from '../services/healthService';
import { Colors } from '../theme/theme';

interface PermissionGateProps {
  children: React.ReactNode;
}

export default function PermissionGate({ children }: PermissionGateProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const checkPermission = async () => {
    try {
      const permitted = await checkStepPermission();
      setHasPermission(permitted);
    } catch (e) {
      setHasPermission(false);
    }
  };

  useEffect(() => {
    checkPermission();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary || '#00E676'} />
      </View>
    );
  }

  if (!hasPermission) {
    return <PermissionScreen onPermissionGranted={() => setHasPermission(true)} />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
