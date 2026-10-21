import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

type Props = {
  /** 'light' sits on a navy background, 'dark' on white. */
  tone?: 'light' | 'dark';
  size?: 'md' | 'lg';
  tagline?: boolean;
};

const SIZES = {
  md: { tile: 72, icon: 40, name: 28, radius: 22 },
  lg: { tile: 128, icon: 74, name: 40, radius: 38 },
};

/** The app logo (shield tile) with the MyDocs RSA name. Same logo on the splash, sign-in and every header. */
export function BrandMark({ tone = 'dark', size = 'md', tagline = true }: Props) {
  const s = SIZES[size];
  const light = tone === 'light';
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.tile,
          { width: s.tile, height: s.tile, borderRadius: s.radius },
          light ? styles.tileLight : styles.tileDark,
        ]}>
        <Ionicons name="shield-checkmark" size={s.icon} color={light ? '#FFFFFF' : colors.primary} />
      </View>
      <Text style={[styles.name, { fontSize: s.name, color: light ? '#FFFFFF' : colors.navy }]}>
        My<Text style={{ color: light ? '#60A5FA' : colors.primary }}>Docs</Text> RSA
      </Text>
      {tagline ? (
        <Text style={[styles.tagline, { color: light ? 'rgba(255,255,255,0.75)' : colors.muted }]}>
          Secure document management
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  tile: { alignItems: 'center', justifyContent: 'center' },
  tileLight: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  tileDark: { backgroundColor: colors.primarySoft },
  name: { fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 14 },
});
