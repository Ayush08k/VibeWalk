import React from 'react';
import { StatusBar, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import PermissionGate from './components/PermissionGate';
import { Colors } from './theme/theme';

const Tab = createBottomTabNavigator();

const customTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors?.background || '#09090F',
    card: Colors?.background || '#09090F',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PermissionGate>
        <StatusBar barStyle="light-content" backgroundColor="#09090F" />
        <NavigationContainer theme={customTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ focused, color }) => {
                let iconName;
                if (route.name === 'Today') {
                  iconName = focused ? '●' : '○';
                } else if (route.name === 'History') {
                  iconName = focused ? '▊' : '▫';
                }
                return <Text style={{ color, fontSize: 20 }}>{iconName}</Text>;
              },
              tabBarActiveTintColor: Colors?.primary || '#00F5FF',
              tabBarInactiveTintColor: Colors?.textTertiary || '#606080',
              tabBarStyle: {
                backgroundColor: Colors?.background || '#09090F',
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.06)',
                elevation: 0,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500' as const,
              },
            })}
          >
            <Tab.Screen name="Today" component={HomeScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PermissionGate>
    </SafeAreaProvider>
  );
}

