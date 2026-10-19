import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { CredentialStatusBadge } from '@/components/badge';
import { DOC_COLORS } from '@/components/doc-icon';
import { formatDate } from '@/lib/format';
import { documentTypeLabel, type Credential } from '@/lib/types';

type Props = { credential: Credential; holderName: string };

/** The wallet-style digital card shown at the top of a verified document. */
export function CredentialCard({ credential, holderName }: Props) {
  const active = credential.status === 'ACTIVE';
  const background = active ? DOC_COLORS[credential.documentType] ?? '#1D4ED8' : '#6B7280';

  return (
    <View style={[styles.card, { backgroundColor: background }]}>
      <View style={styles.top}>
        <View style={styles.brand}>
          <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          <Text style={styles.brandText}>MyDocs RSA</Text>
        </View>
        <CredentialStatusBadge status={credential.status} />
      </View>

      <Text style={styles.type}>{documentTypeLabel(credential.documentType)}</Text>
      <Text style={styles.holder} numberOfLines={1}>
        {holderName}
      </Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.small}>VALID UNTIL</Text>
          <Text style={styles.value}>{formatDate(credential.validUntil)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.small}>CARD NO.</Text>
          <Text style={styles.value}>#{credential.credentialId}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 6,
    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.18)',
    elevation: 4,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13, letterSpacing: 0.4 },
  type: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 18 },
  holder: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  small: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  value: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 2 },
});
