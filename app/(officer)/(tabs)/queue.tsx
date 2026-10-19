import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { LoadError } from '@/components/load-error';
import { Page } from '@/components/page';
import { RequestRow } from '@/components/request-row';
import { SearchField } from '@/components/search-field';
import { cardShadow, colors, radius } from '@/constants/colors';
import { fetchOfficerQueue } from '@/lib/officer';
import { documentTypeLabel, type CertificationRequest } from '@/lib/types';
import { useLoad } from '@/lib/use-load';

export default function OfficerQueueScreen() {
  const router = useRouter();
  const queue = useLoad(fetchOfficerQueue);
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const matches = (r: CertificationRequest) =>
    !q || (r.applicantName ?? '').toLowerCase().includes(q) || documentTypeLabel(r.documentType).toLowerCase().includes(q);

  const allPending = queue.data?.pending ?? [];
  const allInReview = queue.data?.inReview ?? [];
  const pending = allPending.filter(matches);
  const inReview = allInReview.filter(matches);

  const open = (r: CertificationRequest) => router.push(`/review/${r.requestId}`);

  return (
    <Page
      title="Review Queue"
      subtitle={`${allPending.length} waiting · ${allInReview.length} in review`}
      refreshing={queue.refreshing}
      onRefresh={queue.refresh}>
      <SearchField value={search} onChangeText={setSearch} placeholder="Search by applicant or document" />

      {queue.loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : queue.error ? (
        <LoadError state={queue} />
      ) : (
        <>
          <Text style={styles.section}>Waiting for review ({pending.length})</Text>
          {pending.length === 0 ? (
            <Empty text={q ? 'No waiting requests match your search.' : 'Nothing is waiting. New requests appear here.'} />
          ) : (
            pending.map((r) => (
              <RequestRow key={r.requestId} request={r} onPress={() => open(r)} />
            ))
          )}

          <Text style={styles.section}>In review ({inReview.length})</Text>
          {inReview.length === 0 ? (
            <Empty text={q ? 'No requests in review match your search.' : 'No requests are being reviewed right now.'} />
          ) : (
            inReview.map((r) => (
              <RequestRow
                key={r.requestId}
                request={r}
                onPress={() => open(r)}
                lines={r.reviewedByName ? [`Being reviewed by ${r.reviewedByName}`] : []}
              />
            ))
          )}
        </>
      )}
    </Page>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="checkmark-done-outline" size={22} color={colors.faint} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 6 },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...cardShadow,
  },
  emptyText: { flex: 1, fontSize: 14, color: colors.muted },
});
