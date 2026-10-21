import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { DocumentCard } from '@/components/document-card';
import { LoadError } from '@/components/load-error';
import { Page } from '@/components/page';
import { Pill } from '@/components/pill';
import { textStyles, type IconName } from '@/components/ui-kit';
import { cardShadow, colors, radius } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { fetchMyRequests } from '@/lib/certification';
import { useLoad } from '@/lib/use-load';

const PENDING = ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION_REQUIRED'];

function initials(name: string | undefined) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** The user's home: greeting, document totals, quick actions and the latest documents. */
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const load = useLoad(fetchMyRequests);

  const requests = load.data ?? [];
  const pending = requests.filter((r) => PENDING.includes(r.status)).length;
  const verified = requests.filter((r) => r.status === 'APPROVED').length;
  const rejected = requests.filter((r) => r.status === 'REJECTED' || r.status === 'RESUBMISSION_REQUIRED').length;
  const firstName = user?.fullName?.split(' ')[0] ?? '';
  const recent = [...requests].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, 3);

  return (
    <Page
      title={firstName ? `Hello, ${firstName}` : 'Hello'}
      subtitle="Welcome back"
      right={
        <Pressable onPress={() => router.push('/account')} style={styles.avatar} accessibilityLabel="Profile">
          <Text style={styles.avatarText}>{initials(user?.fullName)}</Text>
        </Pressable>
      }
      refreshing={load.refreshing}
      onRefresh={load.refresh}>
      {load.loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : load.error ? (
        <LoadError state={load} />
      ) : (
        <>
          <Pressable onPress={() => router.push('/wallet')} style={styles.total}>
            <View style={styles.totalTop}>
              <Text style={styles.totalLabel}>Total documents</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.faint} />
            </View>
            <Text style={styles.totalValue}>{requests.length}</Text>
            <View style={styles.pills}>
              <Pill label={`${pending} Pending`} tone="warn" />
              <Pill label={`${verified} Verified`} tone="good" />
              <Pill label={`${rejected} Rejected`} tone="bad" />
            </View>
          </Pressable>

          <View style={styles.grid}>
            <Tile icon="add-circle-outline" label="Add document" fg="#16A34A" bg="#DCFCE7" onPress={() => router.push('/new-request')} />
            <Tile icon="time-outline" label="Track requests" fg="#7C3AED" bg="#EDE9FE" onPress={() => router.push('/requests')} />
            <Tile icon="document-text-outline" label="View documents" fg={colors.primary} bg={colors.primarySoft} onPress={() => router.push('/wallet')} />
            <Tile icon="person-outline" label="Profile" fg="#4F46E5" bg="#E0E7FF" onPress={() => router.push('/account')} />
          </View>

          {recent.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Text style={textStyles.section}>Recent documents</Text>
              {recent.map((r) => (
                <DocumentCard key={r.requestId} request={r} onPress={() => router.push(`/document/${r.requestId}`)} />
              ))}
            </View>
          ) : null}
        </>
      )}
    </Page>
  );
}

function Tile({ icon, label, fg, bg, onPress }: { icon: IconName; label: string; fg: string; bg: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed ? { opacity: 0.88 } : null]}>
      <View style={[styles.tileIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={fg} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.navy, fontWeight: '800', fontSize: 15 },
  total: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, gap: 4, ...cardShadow },
  totalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 36, fontWeight: '800', color: colors.navy },
  pills: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    gap: 14,
    minHeight: 112,
    justifyContent: 'space-between',
    ...cardShadow,
  },
  tileIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
});
