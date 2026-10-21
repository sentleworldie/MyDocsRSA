import { Tabs } from 'expo-router';

import { tabIcon, tabScreenOptions } from '@/components/tab-icon';

export default function UserLayout() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="wallet" options={{ title: 'Documents', tabBarIcon: tabIcon('document-text', 'document-text-outline') }} />
      <Tabs.Screen name="requests" options={{ title: 'Requests', tabBarIcon: tabIcon('time', 'time-outline') }} />
      <Tabs.Screen name="account" options={{ title: 'Profile', tabBarIcon: tabIcon('person', 'person-outline') }} />
      {/* Opened from buttons and list rows, so they have no tab of their own */}
      <Tabs.Screen name="new-request" options={{ href: null }} />
      <Tabs.Screen name="document/[id]" options={{ href: null }} />
    </Tabs>
  );
}
