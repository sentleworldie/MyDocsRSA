import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import type { IconName } from '@/components/ui-kit';

/** Builds a tab-bar icon that is filled when its tab is selected and outlined otherwise. */
export function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={focused ? active : inactive} color={color} size={size} />;
  };
}

/** Shared look of the bottom tab bar. */
export const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: '#1D4ED8',
  tabBarInactiveTintColor: '#94A3B8',
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
  tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0' },
};
