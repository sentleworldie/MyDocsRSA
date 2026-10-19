import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

export type PillTone = 'neutral' | 'good' | 'warn' | 'bad' | 'info';

const TONES: Record<PillTone, { bg: string; fg: string }> = {
  neutral: { bg: '#EEF1F5', fg: '#3A4553' },
  good: { bg: colors.successBg, fg: colors.success },
  warn: { bg: colors.warnBg, fg: colors.warn },
  bad: { bg: colors.dangerBg, fg: colors.danger },
  info: { bg: colors.infoBg, fg: colors.primary },
};

/** A small rounded status label with a coloured dot, e.g. "Verified" or "Pending". */
export function Pill({ label, tone = 'neutral' }: { label: string; tone?: PillTone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <View style={[styles.dot, { backgroundColor: t.fg }]} />
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '700' },
});
