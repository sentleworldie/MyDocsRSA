import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { colors } from '@/constants/colors';

const RINGS = [0, 1, 2, 3, 4, 5, 6, 7];

/** Full-screen navy welcome page: logo, name, tagline. Shown on launch and while the saved login is restored. */
export function Splash() {
  return (
    <LinearGradient colors={[colors.navy, '#0C2A7A', colors.navy]} style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.center}>
        <BrandMark tone="light" size="lg" tagline={false} />
        <Text style={styles.line}>Your Documents. Your Control.</Text>
      </View>

      <Text style={styles.steps}>Store   ·   Verify   ·   Access</Text>

      {/* Fine ring pattern rising from the bottom edge (security-print feel) */}
      <View style={styles.ringAnchor} pointerEvents="none">
        {RINGS.map((i) => {
          const size = 120 + i * 56;
          return (
            <View
              key={i}
              style={[styles.ring, { width: size, height: size, borderRadius: size / 2, left: -size / 2, top: -size / 2 }]}
            />
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  center: { alignItems: 'center', gap: 22 },
  line: { color: '#FFFFFF', fontSize: 16 },
  steps: { position: 'absolute', bottom: '26%', color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  ringAnchor: { position: 'absolute', bottom: 0, left: '50%', width: 0, height: 0 },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(96,165,250,0.18)' },
});
