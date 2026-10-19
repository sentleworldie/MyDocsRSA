import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

/** App logo tile, name and tagline for the sign-in and register screens. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.tile, compact ? styles.tileSmall : null]}>
        <Ionicons name="shield-checkmark" size={compact ? 28 : 38} color={colors.primary} />
      </View>
      <Text style={styles.name}>MyDocs RSA</Text>
      <Text style={styles.tagline}>Secure Document Management</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4, marginBottom: 12 },
  tile: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileSmall: { width: 56, height: 56, borderRadius: 16 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  tagline: { fontSize: 13, color: colors.muted },
});
