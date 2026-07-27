import React from 'react';
import { StatusBar, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import TrackerScreen from './screens/TrackerScreen';
import PlannerScreen from './screens/PlannerScreen';
import BadgesScreen from './screens/BadgesScreen';
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
                let iconSymbol = '●';
                if (route.name === 'Today') iconSymbol = focused ? '⚡' : '⚡';
                else if (route.name === 'GPS Walk') iconSymbol = focused ? '📍' : '🗺️';
                else if (route.name === 'AI Planner') iconSymbol = focused ? '🤖' : '💡';
                else if (route.name === 'Badges') iconSymbol = focused ? '🏆' : '🏅';
                else if (route.name === 'History') iconSymbol = focused ? '📊' : '📈';
                return <Text style={{ color, fontSize: 16 }}>{iconSymbol}</Text>;
              },
              tabBarActiveTintColor: Colors?.primary || '#00F5FF',
              tabBarInactiveTintColor: Colors?.textTertiary || '#606080',
              tabBarStyle: {
                backgroundColor: Colors?.background || '#09090F',
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.08)',
                elevation: 0,
                height: 60,
                paddingBottom: 8,
                paddingTop: 6,
              },
              tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: '700' as const,
              },
            })}
          >
            <Tab.Screen name="Today" component={HomeScreen} />
            <Tab.Screen name="GPS Walk" component={TrackerScreen} />
            <Tab.Screen name="AI Planner" component={PlannerScreen} />
            <Tab.Screen name="Badges" component={BadgesScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PermissionGate>
    </SafeAreaProvider>
  );
}
