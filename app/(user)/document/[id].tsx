import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native';

import { CredentialCard } from '@/components/credential-card';
import { LoadError } from '@/components/load-error';
import { Page } from '@/components/page';
import { Banner, Button, type IconName } from '@/components/ui-kit';
import { cardShadow, colors, radius } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { fetchMyDocuments } from '@/lib/certification';
import { openDocument } from '@/lib/documents';
import { formatDate } from '@/lib/format';
import { documentTypeLabel, type CertificationRequest, type RequestStatus } from '@/lib/types';
import { useLoad } from '@/lib/use-load';
import { useResubmit } from '@/lib/use-resubmit';

function explain(r: CertificationRequest): { kind: 'info' | 'success' | 'error'; text: string } {
  switch (r.status) {
    case 'SUBMITTED':
      return { kind: 'info', text: 'Your document is waiting for an officer to pick it up.' };
    case 'UNDER_REVIEW':
    case 'INVESTIGATION_REQUIRED':
      return { kind: 'info', text: 'An officer is checking your document right now.' };
    case 'APPROVED':
      return {
        kind: 'success',
        text: 'An officer verified this document. Share the verification code with anyone who needs to confirm it is genuine.',
      };
    case 'REJECTED':
      return { kind: 'error', text: r.notes ? `Rejected: ${r.notes}` : 'This document was rejected.' };
    case 'RESUBMISSION_REQUIRED':
      return { kind: 'error', text: r.notes ? `The officer needs a new copy: ${r.notes}` : 'The officer needs a new copy of this document.' };
  }
}

const HERO: Record<RequestStatus, { icon: IconName; color: string; bg: string; title: string }> = {
  SUBMITTED: { icon: 'hourglass-outline', color: colors.warn, bg: colors.warnBg, title: 'Pending review' },
  UNDER_REVIEW: { icon: 'search-outline', color: colors.primary, bg: colors.infoBg, title: 'In review' },
  INVESTIGATION_REQUIRED: { icon: 'search-outline', color: colors.primary, bg: colors.infoBg, title: 'In review' },
  APPROVED: { icon: 'checkmark-circle-outline', color: colors.success, bg: colors.successBg, title: 'Verified' },
  REJECTED: { icon: 'close-circle-outline', color: colors.danger, bg: colors.dangerBg, title: 'Rejected' },
  RESUBMISSION_REQUIRED: { icon: 'refresh-outline', color: colors.danger, bg: colors.dangerBg, title: 'Action needed' },
};

export default function DocumentDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = Number(id);

  const docs = useLoad(fetchMyDocuments);
  const resubmit = useResubmit(requestId, docs.refresh);
  const [actionError, setActionError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const request = docs.data?.requests.find((r) => r.requestId === requestId);
  const credential = request ? docs.data?.credentials.find((c) => c.documentId === request.documentId) : undefined;

  if (docs.loading && !request) {
    return (
      <Page title="Document" back>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </Page>
    );
  }

  if (!request) {
    return (
      <Page title="Document" back>
        {docs.error ? <LoadError state={docs} /> : <Banner message="We could not find this document. It may have been removed." />}
      </Page>
    );
  }

  const info = explain(request);
  const verified = request.status === 'APPROVED';
  const decided = !!request.reviewedAt;

  async function download() {
    if (!request) return;
    setActionError('');
    setDownloading(true);
    try {
      await openDocument(request.documentId, request.originalFileName);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Could not download the document.');
    } finally {
      setDownloading(false);
    }
  }

  async function shareCode() {
    if (!credential) return;
    setActionError('');
    try {
      await Share.share({
        message: `MyDocs RSA verification code for ${documentTypeLabel(request!.documentType)}: ${credential.verificationCode}`,
      });
    } catch {
      setActionError('Could not open the share sheet.');
    }
  }

  return (
    <Page title={documentTypeLabel(request.documentType)} subtitle={`Request #${request.requestId}`} back refreshing={docs.refreshing} onRefresh={docs.refresh}>
      {verified && credential ? (
        <CredentialCard credential={credential} holderName={user?.fullName ?? ''} />
      ) : (
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, { backgroundColor: HERO[request.status].bg }]}>
            <Ionicons name={HERO[request.status].icon} size={28} color={HERO[request.status].color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, { color: HERO[request.status].color }]}>{HERO[request.status].title}</Text>
            <Text style={styles.statusSub}>Submitted {formatDate(request.createdAt)}</Text>
          </View>
        </View>
      )}

      <Banner kind={info.kind} message={info.text} />

      <View style={styles.table}>
        {[
          { label: 'Document', value: documentTypeLabel(request.documentType) },
          { label: 'Submitted', value: formatDate(request.createdAt) },
          {
            label: 'Processing',
            value: request.processingPath === 'FAST_TRACK_CERTIFIED_COPY' ? 'Fast track (certified copy)' : 'Full investigation',
          },
          decided ? { label: 'Decision on', value: formatDate(request.reviewedAt) } : null,
          request.reviewedByName ? { label: verified ? 'Verified by' : 'Handled by', value: request.reviewedByName } : null,
          credential ? { label: 'Valid until', value: formatDate(credential.validUntil) } : null,
          credential ? { label: 'Verification code', value: credential.verificationCode, mono: true } : null,
        ]
          .filter((row): row is { label: string; value: string; mono?: boolean } => row !== null)
          .map((row, index, all) => (
            <Row key={row.label} label={row.label} value={row.value} mono={row.mono} last={index === all.length - 1} />
          ))}
      </View>

      {actionError ? <Banner message={actionError} /> : null}
      {resubmit.error ? <Banner message={resubmit.error} /> : null}

      {verified ? (
        <>
          {credential ? <Button title="Share verification code" icon="share-outline" onPress={shareCode} /> : null}
          <Button title="Download document" icon="download-outline" variant="secondary" onPress={download} loading={downloading} />
        </>
      ) : null}

      {request.status === 'RESUBMISSION_REQUIRED' ? (
        <Button title="Upload corrected document" icon="cloud-upload-outline" onPress={resubmit.start} loading={resubmit.busy} />
      ) : null}

      {request.status === 'REJECTED' ? (
        <Button title="Submit a new request" icon="add-circle-outline" variant="secondary" onPress={() => router.push('/new-request')} />
      ) : null}
    </Page>
  );
}

function Row({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <View style={[styles.row, last ? { borderBottomWidth: 0 } : null]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono ? styles.mono : null]} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...cardShadow,
  },
  statusIcon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 20, fontWeight: '800' },
  statusSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  table: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    ...cardShadow,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 13, color: colors.muted },
  rowValue: { flexShrink: 1, fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 12 },
});
