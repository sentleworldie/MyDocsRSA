import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { LoadError } from '@/components/load-error';
import { Page } from '@/components/page';
import { StatCard, StatGrid } from '@/components/stat-card';
import { cardShadow, colors, radius } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { fetchAdminStats } from '@/lib/admin';
import { useLoad } from '@/lib/use-load';

export default function AdminOverviewScreen() {
  const { user } = useAuth();
  const stats = useLoad(fetchAdminStats);
  const data = stats.data;

  return (
    <Page title="Dashboard" subtitle={`System overview for ${user?.fullName ?? ''}`} refreshing={stats.refreshing} onRefresh={stats.refresh}>
      {stats.loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : stats.error || !data ? (
        <LoadError state={stats} fallback="Could not load the statistics." />
      ) : (
        <>
          <Text style={styles.section}>People</Text>
          <StatGrid>
            <StatCard label="Users" value={data.users.users} icon="people-outline" />
            <StatCard label="Officers" value={data.users.officers} icon="shield-checkmark-outline" tone="good" />
            <StatCard label="Admins" value={data.users.admins} icon="key-outline" />
            <StatCard label="Inactive accounts" value={data.users.inactive} icon="person-remove-outline" tone={data.users.inactive > 0 ? 'bad' : 'default'} />
          </StatGrid>

          <Text style={styles.section}>Certification requests</Text>
          <StatGrid>
            <StatCard label="Total requests" value={data.requests.total} icon="documents-outline" />
            <StatCard label="Waiting for review" value={data.requests.waiting} icon="hourglass-outline" tone={data.requests.waiting > 0 ? 'warn' : 'default'} />
            <StatCard label="In review" value={data.requests.underReview} icon="search-outline" tone="warn" />
            <StatCard label="Verified" value={data.requests.approved} icon="checkmark-done-outline" tone="good" />
            <StatCard label="Rejected" value={data.requests.rejected} icon="close-circle-outline" tone="bad" />
            <StatCard label="Resubmission needed" value={data.requests.resubmissionRequired} icon="refresh-outline" tone="warn" />
          </StatGrid>

          <Text style={styles.section}>Requests by status</Text>
          <View style={styles.chart}>
            {[
              { label: 'Pending', value: data.requests.waiting, color: '#B45309' },
              { label: 'In review', value: data.requests.underReview, color: colors.primary },
              { label: 'Verified', value: data.requests.approved, color: colors.success },
              { label: 'Rejected', value: data.requests.rejected, color: colors.danger },
              { label: 'Resubmission', value: data.requests.resubmissionRequired, color: '#EA580C' },
            ].map((bar) => {
              const percent = data.requests.total > 0 ? (bar.value / data.requests.total) * 100 : 0;
              return (
                <View key={bar.label} style={{ gap: 5 }}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabel}>{bar.label}</Text>
                    <Text style={styles.barValue}>{bar.value}</Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${percent}%`, backgroundColor: bar.color }]} />
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.section}>Digital cards</Text>
          <StatGrid>
            <StatCard label="Issued in total" value={data.credentials.total} icon="card-outline" />
            <StatCard label="Active" value={data.credentials.active} icon="checkmark-circle-outline" tone="good" />
            <StatCard label="Expired" value={data.credentials.expired} icon="time-outline" tone="warn" />
            <StatCard label="Revoked" value={data.credentials.revoked} icon="ban-outline" tone="bad" />
          </StatGrid>
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 6 },
  chart: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
    ...cardShadow,
  },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: 13, color: colors.text },
  barValue: { fontSize: 13, fontWeight: '700', color: colors.text },
  track: { height: 10, borderRadius: 5, backgroundColor: '#EEF1F5', overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
});
