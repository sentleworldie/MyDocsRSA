import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RequestStatusBadge } from '@/components/badge';
import { DocIcon } from '@/components/doc-icon';
import { Banner, Button } from '@/components/ui-kit';
import { cardShadow, colors, radius } from '@/constants/colors';
import { formatDate } from '@/lib/format';
import { documentTypeLabel, type CertificationRequest, type RequestStatus } from '@/lib/types';
import { useResubmit } from '@/lib/use-resubmit';

// 0 = submitted, 1 = being reviewed, 2 = decision made
function progressStep(status: RequestStatus): number {
  if (status === 'SUBMITTED') return 0;
  if (status === 'UNDER_REVIEW' || status === 'INVESTIGATION_REQUIRED') return 1;
  return 2;
}

const STEP_LABELS = ['Submitted', 'In review', 'Decision'];

type Props = {
  request: CertificationRequest;
  onPress: () => void; // open the document detail
  onChanged: () => void; // reload the list after a resubmission
};

export function RequestCard({ request, onPress, onChanged }: Props) {
  const resubmit = useResubmit(request.requestId, onChanged);
  const step = progressStep(request.status);
  const failed = request.status === 'REJECTED' || request.status === 'RESUBMISSION_REQUIRED';

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.top}>
        <DocIcon type={request.documentType} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {documentTypeLabel(request.documentType)}
          </Text>
          <Text style={styles.meta}>
            Submitted {formatDate(request.createdAt)} ·{' '}
            {request.processingPath === 'FAST_TRACK_CERTIFIED_COPY' ? 'Fast track' : 'Full investigation'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.faint} />
      </Pressable>

      <RequestStatusBadge status={request.status} />

      <View style={styles.progress}>
        {STEP_LABELS.map((label, index) => {
          const reached = index <= step;
          const isLast = index === 2;
          const dotColor = !reached
            ? colors.border
            : isLast && failed
              ? colors.danger
              : isLast && request.status === 'APPROVED'
                ? colors.success
                : colors.primary;
          return (
            <View key={label} style={styles.progressItem}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <Text style={[styles.progressLabel, reached ? styles.progressLabelOn : null]}>{label}</Text>
            </View>
          );
        })}
      </View>

      {request.status === 'APPROVED' ? (
        <Banner kind="success" message="Verified. Your digital card is ready in My Documents." />
      ) : null}
      {failed && request.notes ? <Banner message={`Officer note: ${request.notes}`} /> : null}

      {request.status === 'RESUBMISSION_REQUIRED' ? (
        <>
          {resubmit.error ? <Banner message={resubmit.error} /> : null}
          <Button title="Upload corrected document" icon="cloud-upload-outline" onPress={resubmit.start} loading={resubmit.busy} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    ...cardShadow,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  progress: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  progressItem: { alignItems: 'center', flex: 1, gap: 5 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  progressLabel: { fontSize: 11, color: colors.muted },
  progressLabelOn: { color: colors.text, fontWeight: '700' },
});
