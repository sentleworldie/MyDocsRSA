import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

export type Chip<T extends string> = { value: T; label: string; count?: number };

type Props<T extends string> = {
  chips: Chip<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

/** A wrapping row of filter buttons, e.g. All / Verified / Rejected. */
export function FilterChips<T extends string>({ chips, selected, onSelect }: Props<T>) {
  return (
    <View style={styles.row}>
      {chips.map((chip) => {
        const on = chip.value === selected;
        return (
          <Pressable key={chip.value} onPress={() => onSelect(chip.value)} style={[styles.chip, on ? styles.chipOn : null]}>
            <Text style={[styles.text, on ? styles.textOn : null]}>
              {chip.label}
              {chip.count !== undefined ? ` ${chip.count}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, color: colors.text, fontWeight: '600' },
  textOn: { color: colors.primaryText },
});
