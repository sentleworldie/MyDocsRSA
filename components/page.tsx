import { Ionicons } from '@expo/vector-icons';
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
  /** A round floating action button in the bottom-right corner. */
  fab?: { label: string; onPress: () => void };
};

/**
 * Standard screen: a blue header bar (title, optional back arrow and action), then a
 * scrolling content area on a light background. Pull down to refresh when onRefresh is given.
 */
export function Page({ title, subtitle, back, right, children, refreshing = false, onRefresh, fab }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerRow}>
          {back ? (
            <Pressable
              onPress={() => {
                if (router.canGoBack()) router.back();
              }}
              hitSlop={12}
              style={styles.backButton}
              accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
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
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, fab ? { paddingBottom: 110 } : null]}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}>
        {children}
      </ScrollView>

      {fab ? (
        <Pressable
          onPress={fab.onPress}
          style={({ pressed }) => [styles.fabWrap, pressed ? { opacity: 0.8 } : null]}
          accessibilityRole="button"
          accessibilityLabel={fab.label}>
          <View style={styles.fab}>
            <Ionicons name="add" size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.fabLabel}>{fab.label}</Text>
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
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 3 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  fabWrap: { position: 'absolute', right: 20, bottom: 20, alignItems: 'center', gap: 2 },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.4)',
    elevation: 6,
  },
  fabLabel: { fontSize: 11, fontWeight: '700', color: colors.muted },
});
