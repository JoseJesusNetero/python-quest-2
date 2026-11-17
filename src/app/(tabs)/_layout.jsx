
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const icons = {
  index: '🏠',
  worlds: '🗺️',
  learn: '💻',
  profile: '🏆',
};

const labels = {
  index: 'Início',
  worlds: 'Mundos',
  learn: 'Aprender',
  profile: 'Perfil',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#F6B93B',
        tabBarInactiveTintColor: '#A9B5C7',
        tabBarStyle: {
          backgroundColor: '#183D70',
          borderTopColor: '#315B8B',
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
          fontSize: 11,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 25 : 22 }}>
            {icons[route.name]}
          </Text>
        ),
        tabBarLabel: labels[route.name],
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="worlds" options={{ title: 'Mundos' }} />
      <Tabs.Screen name="learn" options={{ title: 'Aprender' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
