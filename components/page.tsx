import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconName } from '@/components/ui-kit';
import { colors } from '@/constants/colors';

type Props = {
  title: string;
  subtitle?: string;
  /** Show a back arrow in the header. */
  back?: boolean;
  /** Something to show on the right of the header, e.g. a <HeaderButton />. */
  right?: ReactNode;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** A round blue "+" button floating in the bottom-right corner. */
  fab?: { label: string; onPress: () => void };
};

/**
 * Standard screen: a navy header (title, optional back arrow and action) with the first card of
 * the content overlapping its curved bottom edge. Pull down to refresh when onRefresh is given.
 */
export function Page({ title, subtitle, back, right, children, refreshing = false, onRefresh, fab }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[colors.navy, colors.navyMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerRow}>
          {back ? (
            <Pressable
              onPress={() => {
                if (router.canGoBack()) router.back();
              }}
              hitSlop={12}
              accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ) : null}
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, fab ? { paddingBottom: 110 } : null]}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}>
        {children}
      </ScrollView>

      {fab ? (
        <Pressable
          onPress={fab.onPress}
          style={({ pressed }) => [styles.fab, pressed ? { opacity: 0.88, transform: [{ scale: 0.97 }] } : null]}
          accessibilityRole="button"
          accessibilityLabel={fab.label}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

/** A small round icon button for the header's right side. */
export function HeaderButton({ icon, onPress, label }: { icon: IconName; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.headerButton} accessibilityLabel={label}>
      <Ionicons name={icon} size={22} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerText: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: -0.2 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 3 },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The scroll area starts inside the header's curved edge, so the first card overlaps it
  scroll: { marginTop: -32 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 18px rgba(29, 78, 216, 0.4)',
    elevation: 6,
  },
});
