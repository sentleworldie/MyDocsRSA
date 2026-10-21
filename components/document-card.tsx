import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RequestStatusBadge } from '@/components/badge';
import { DocIcon } from '@/components/doc-icon';
import { cardShadow, colors, radius } from '@/constants/colors';
import { formatDate } from '@/lib/format';
import { documentTypeLabel, type CertificationRequest } from '@/lib/types';

type Props = {
  request: CertificationRequest;
  onPress: () => void;
  /** Shown as a download button on verified documents. */
  onDownload?: () => void;
};

/** One row of a document list: icon, name, date, optional download, and a coloured status pill on the right. */
export function DocumentCard({ request, onPress, onDownload }: Props) {
  const verified = request.status === 'APPROVED';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? { opacity: 0.88 } : null]}>
      <DocIcon type={request.documentType} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {documentTypeLabel(request.documentType)}
        </Text>
        <Text style={styles.meta}>{formatDate(request.createdAt)}</Text>
      </View>

      {verified && onDownload ? (
        <Pressable onPress={onDownload} hitSlop={8} style={styles.download} accessibilityLabel="Download document">
          <Ionicons name="download-outline" size={18} color={colors.primary} />
        </Pressable>
      ) : null}
      <RequestStatusBadge status={request.status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    ...cardShadow,
  },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  download: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
