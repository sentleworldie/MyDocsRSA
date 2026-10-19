import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { DocumentCard } from '@/components/document-card';
import { LoadError } from '@/components/load-error';
import { HeaderButton, Page } from '@/components/page';
import { Banner, Button } from '@/components/ui-kit';
import { cardShadow, colors, radius } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { fetchMyDocuments } from '@/lib/certification';
import { openDocument } from '@/lib/documents';
import type { CertificationRequest } from '@/lib/types';
import { useLoad } from '@/lib/use-load';

export default function DocumentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const docs = useLoad(fetchMyDocuments);
  const [downloadError, setDownloadError] = useState('');

  const requests = docs.data?.requests ?? [];
  const verified = requests.filter((r) => r.status === 'APPROVED').length;
  const waiting = requests.filter((r) => ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION_REQUIRED'].includes(r.status)).length;
  const action = requests.filter((r) => r.status === 'RESUBMISSION_REQUIRED' || r.status === 'REJECTED').length;
  const firstName = user?.fullName?.split(' ')[0] ?? '';

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
      title="My Documents"
      subtitle={`Welcome back, ${firstName}`}
      right={<HeaderButton icon="person-circle-outline" label="Profile" onPress={() => router.push('/account')} />}
      refreshing={docs.refreshing}
      onRefresh={docs.refresh}
      fab={{ label: 'Add', onPress: () => router.push('/new-request') }}>
      {docs.loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
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
          <Button title="Add your first document" icon="add-circle-outline" onPress={() => router.push('/new-request')} />
        </View>
      ) : (
        <>
          <View style={styles.summary}>
            <Tile value={verified} label="Verified" color={colors.success} />
            <View style={styles.divider} />
            <Tile value={waiting} label="In progress" color={colors.primary} />
            <View style={styles.divider} />
            <Tile value={action} label="Needs action" color={action > 0 ? colors.danger : colors.muted} />
          </View>

          {verified > 0 ? (
            <View style={styles.note}>
              <Ionicons name="download-outline" size={14} color={colors.muted} />
              <Text style={styles.noteText}>Verified documents can be downloaded or shared from here.</Text>
            </View>
          ) : null}
          {downloadError ? <Banner message={downloadError} /> : null}

          {requests.map((r) => (
            <DocumentCard
              key={r.requestId}
              request={r}
              onPress={() => router.push(`/document/${r.requestId}`)}
              onDownload={() => download(r)}
            />
          ))}

        </>
      )}
    </Page>
  );
}

function Tile({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    ...cardShadow,
  },
  tile: { flex: 1, alignItems: 'center' },
  tileValue: { fontSize: 24, fontWeight: '800' },
  tileLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  divider: { width: 1, backgroundColor: colors.border },
  note: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  noteText: { fontSize: 12, color: colors.muted },
  empty: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
