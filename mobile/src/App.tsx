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
    background: Colors?.background || '#000000',
    card: Colors?.background || '#000000',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PermissionGate>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
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
              tabBarActiveTintColor: Colors?.primary || '#00E676',
              tabBarInactiveTintColor: Colors?.textTertiary || '#666666',
              tabBarStyle: {
                backgroundColor: Colors?.background || '#000000',
                borderTopWidth: 0,
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

