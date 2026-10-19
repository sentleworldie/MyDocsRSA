import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/components/ui-kit';
import { cardShadow, colors, radius } from '@/constants/colors';

type Tone = 'default' | 'good' | 'warn' | 'bad';

const TONES: Record<Tone, { fg: string; bg: string }> = {
  default: { fg: colors.primary, bg: colors.primarySoft },
  good: { fg: colors.success, bg: colors.successBg },
  warn: { fg: colors.warn, bg: colors.warnBg },
  bad: { fg: colors.danger, bg: colors.dangerBg },
};

export function StatCard({ label, value, icon, tone = 'default' }: { label: string; value: number | string; icon: IconName; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: t.bg }]}>
        <Ionicons name={icon} size={20} color={t.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </View>
  );
}

/** Lays stat cards out two per row. */
export function StatGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    ...cardShadow,
  },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 22, fontWeight: '800', color: colors.text },
  label: { fontSize: 12, color: colors.muted },
});
