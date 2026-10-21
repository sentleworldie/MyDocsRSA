import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { DocumentCard } from '@/components/document-card';
import { FilterChips, type Chip } from '@/components/filter-chips';
import { LoadError } from '@/components/load-error';
import { Page } from '@/components/page';
import { Banner, Button } from '@/components/ui-kit';
import { cardShadow, colors, radius } from '@/constants/colors';
import { ApiError } from '@/lib/api';
import { fetchMyRequests } from '@/lib/certification';
import { openDocument } from '@/lib/documents';
import type { CertificationRequest } from '@/lib/types';
import { useLoad } from '@/lib/use-load';

type Filter = 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED';

function inFilter(r: CertificationRequest, f: Filter) {
  switch (f) {
    case 'ALL':
      return true;
    case 'PENDING':
      return ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION_REQUIRED'].includes(r.status);
    case 'VERIFIED':
      return r.status === 'APPROVED';
    case 'REJECTED':
      return r.status === 'REJECTED' || r.status === 'RESUBMISSION_REQUIRED';
  }
}

export default function DocumentsScreen() {
  const router = useRouter();
  const docs = useLoad(fetchMyRequests);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [downloadError, setDownloadError] = useState('');

  const requests = docs.data ?? [];
  const count = (f: Filter) => requests.filter((r) => inFilter(r, f)).length;
  const chips: Chip<Filter>[] = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending', count: count('PENDING') },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'REJECTED', label: 'Rejected' },
  ];
  const shown = requests.filter((r) => inFilter(r, filter));

  async function download(request: CertificationRequest) {
    setDownloadError('');
    try {
      await openDocument(request.documentId, request.originalFileName);
    } catch (e) {
      setDownloadError(e instanceof ApiError ? e.message : 'Could not download the document.');
    }
  }

  return (
    <Page
      title="My documents"
      subtitle={requests.length > 0 ? 'Tap a verified document to see its digital card' : undefined}
      refreshing={docs.refreshing}
      onRefresh={docs.refresh}
      fab={{ label: 'Add document', onPress: () => router.push('/new-request') }}>
      {docs.loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : docs.error ? (
        <LoadError state={docs} />
      ) : requests.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="folder-open-outline" size={34} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No documents yet</Text>
          <Text style={styles.emptyText}>
            Add an ID, licence or certificate. Once an officer verifies it, your digital card appears here.
          </Text>
          <View style={{ alignSelf: 'stretch' }}>
            <Button title="Add your first document" icon="add-circle-outline" onPress={() => router.push('/new-request')} />
          </View>
        </View>
      ) : (
        <>
          <FilterChips chips={chips} selected={filter} onSelect={setFilter} />
          {downloadError ? <Banner message={downloadError} /> : null}

          {shown.length === 0 ? (
            <Text style={styles.none}>No documents in this tab.</Text>
          ) : (
            shown.map((r) => (
              <DocumentCard
                key={r.requestId}
                request={r}
                onPress={() => router.push(`/document/${r.requestId}`)}
                onDownload={() => download(r)}
              />
            ))
          )}
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  none: { textAlign: 'center', color: colors.muted, fontSize: 14, marginTop: 24 },
  empty: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    ...cardShadow,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: 6 },
});
