import { StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Pill } from '@/components/pill';
import { Button } from '@/components/ui-kit';
import { cardShadow, colors, radius } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

function initials(name: string | undefined) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Profile screen shared by all three roles. */
export function AccountPanel({ roleLabel }: { roleLabel: string }) {
  const { user, logout } = useAuth();

  return (
    <Page title="Profile" subtitle="Your account details">
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user?.fullName)}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Pill label={roleLabel} tone="info" />
      </View>

      <Button title="Sign out" variant="danger" icon="log-out-outline" onPress={logout} />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    ...cardShadow,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  email: { fontSize: 14, color: colors.muted, marginBottom: 6 },
});
