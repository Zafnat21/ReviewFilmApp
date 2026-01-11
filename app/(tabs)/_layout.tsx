import { Ionicons } from '@expo/vector-icons'; // Ikon bawaan Expo
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      
      {/* Tab 1: Home (Daftar Film) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Daftar Film',
          tabBarIcon: ({ color }) => <Ionicons name="film" size={24} color={color} />,
        }}
      />

      {/* Tab 2: Tambah Film */}
      <Tabs.Screen
        name="add"
        options={{
          title: 'Tambah Film',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}