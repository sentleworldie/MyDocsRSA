import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { RequestStatusBadge } from '@/components/badge';
import { DocumentViewer } from '@/components/document-viewer';
import { LoadError } from '@/components/load-error';
import { Page } from '@/components/page';
import { Banner, Button, Field } from '@/components/ui-kit';
import { cardShadow, colors, radius } from '@/constants/colors';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { approveRequest, fetchOfficerQueue, rejectRequest, requestResubmission, startReview } from '@/lib/officer';
import { documentTypeLabel, type CertificationRequest } from '@/lib/types';
import { useLoad } from '@/lib/use-load';

type Mode = null | 'approve' | 'reject' | 'resubmit';

export default function ReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = Number(id);

  const queue = useLoad(fetchOfficerQueue);
  const [updated, setUpdated] = useState<CertificationRequest | null>(null); // after "Start review"
  const [mode, setMode] = useState<Mode>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [outcome, setOutcome] = useState('');

  const loaded = [...(queue.data?.pending ?? []), ...(queue.data?.inReview ?? [])].find((r) => r.requestId === requestId);
  const request = updated ?? loaded;

  const backToQueue = () => router.back();

  // ---- Finished: show the result and a way back ----
  if (outcome) {
    return (
      <Page title="Done" subtitle="Your decision was saved" back>
        <View style={styles.done}>
          <View style={styles.doneIcon}>
            <Ionicons name="checkmark" size={38} color="#FFFFFF" />
          </View>
          <Text style={styles.doneText}>{outcome}</Text>
        </View>
        <Button title="Back to queue" icon="list-outline" onPress={backToQueue} />
      </Page>
    );
  }

  if (queue.loading && !request) {
    return (
      <Page title="Review Request" back>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </Page>
    );
  }

  if (!request) {
    return (
      <Page title="Review Request" back>
        {queue.error ? <LoadError state={queue} /> : <Banner message="This request is no longer in the queue. It may have been handled already." />}
        <Button title="Back to queue" variant="secondary" onPress={backToQueue} />
      </Page>
    );
  }

  async function run(action: () => Promise<void>) {
    setActionError('');
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  function handleStart() {
    run(async () => {
      setUpdated(await startReview(requestId));
    });
  }

  function handleApprove() {
    run(async () => {
      await approveRequest(requestId);
      setOutcome(`Approved. A digital card was issued to ${request?.applicantName ?? 'the applicant'}.`);
    });
  }

  function handleWithReason(kind: 'reject' | 'resubmit') {
    const text = reason.trim();
    if (text.length < 5) {
      setReasonError('Give a clear reason (at least 5 characters). The applicant will see it.');
      return;
    }
    setReasonError('');
    run(async () => {
      if (kind === 'reject') {
        await rejectRequest(requestId, text);
        setOutcome('Request rejected. The applicant can see your reason.');
      } else {
        await requestResubmission(requestId, text);
        setOutcome('Resubmission requested. The applicant has been asked to upload a new document.');
      }
    });
  }

  function chooseMode(next: Mode) {
    setMode(next);
    setReason('');
    setReasonError('');
    setActionError('');
  }

  const underReview = request.status === 'UNDER_REVIEW';
  const waiting = request.status === 'SUBMITTED' || request.status === 'INVESTIGATION_REQUIRED';
  const fastTrack = request.processingPath === 'FAST_TRACK_CERTIFIED_COPY';

  return (
    <Page title={request.applicantName ?? 'Applicant'} subtitle={documentTypeLabel(request.documentType)} back>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>Request #{request.requestId}</Text>
          <RequestStatusBadge status={request.status} />
        </View>
        <Info label="Submitted" value={formatDate(request.createdAt)} />
        <Info label="Processing" value={fastTrack ? 'Fast track: certified copy' : 'Full investigation: no certified copy'} />
        {request.reviewedByName ? <Info label="Reviewing officer" value={request.reviewedByName} /> : null}
      </View>

      <Text style={styles.section}>Uploaded document</Text>
      <Banner
        kind="info"
        message={
          fastTrack
            ? 'Check the stamp and signature of the commissioner of oaths or police station on the copy.'
            : 'No certified copy was provided. Check the document carefully.'
        }
      />
      <DocumentViewer documentId={request.documentId} fileName={request.originalFileName} />

      {actionError ? <Banner message={actionError} /> : null}

      {waiting ? (
        <>
          <Text style={styles.section}>Next step</Text>
          <Text style={styles.hint}>Start the review to lock this request and unlock the decision buttons.</Text>
          <Button title="Start review" icon="play-outline" onPress={handleStart} loading={busy} />
        </>
      ) : null}

      {underReview ? (
        <>
          <Text style={styles.section}>Decision</Text>

          {mode === null ? (
            <>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Button title="Reject" variant="danger" icon="close" onPress={() => chooseMode('reject')} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Approve" variant="success" icon="checkmark" onPress={() => chooseMode('approve')} />
                </View>
              </View>
              <Button title="Request resubmission" variant="secondary" icon="refresh-outline" onPress={() => chooseMode('resubmit')} />
            </>
          ) : null}

          {mode === 'approve' ? (
            <>
              <Banner
                kind="info"
                message={`This issues a digital card to ${request.applicantName ?? 'the applicant'}. Confirm that the document is genuine.`}
              />
              <Button title="Confirm approval" variant="success" icon="checkmark-circle-outline" onPress={handleApprove} loading={busy} />
              <Button title="Cancel" variant="secondary" onPress={() => chooseMode(null)} />
            </>
          ) : null}

          {mode === 'reject' || mode === 'resubmit' ? (
            <>
              <Field
                label={mode === 'reject' ? 'Reason for rejection' : 'What should the applicant fix?'}
                value={reason}
                onChangeText={setReason}
                error={reasonError}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
                placeholder={
                  mode === 'reject'
                    ? 'e.g. The ID number does not match the records.'
                    : 'e.g. The photo is blurry. Upload a clear, full copy.'
                }
              />
              <Button
                title={mode === 'reject' ? 'Confirm rejection' : 'Send resubmission request'}
                variant={mode === 'reject' ? 'danger' : 'primary'}
                onPress={() => handleWithReason(mode)}
                loading={busy}
              />
              <Button title="Cancel" variant="secondary" onPress={() => chooseMode(null)} />
            </>
          ) : null}
        </>
      ) : null}
    </Page>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
    ...cardShadow,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  info: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  infoLabel: { fontSize: 13, color: colors.muted },
  infoValue: { flexShrink: 1, fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'right' },
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 6 },
  hint: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 10 },
  done: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    ...cardShadow,
  },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 22 },
});
