import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CredentialStatusBadge } from '@/components/badge';
import { DocIcon } from '@/components/doc-icon';
import { FilterChips, type Chip } from '@/components/filter-chips';
import { LoadError } from '@/components/load-error';
import { Page } from '@/components/page';
import { cardShadow, colors, radius } from '@/constants/colors';
import { fetchAdminCredentials, type AdminCredential } from '@/lib/admin';
import { formatDate } from '@/lib/format';
import { documentTypeLabel, type CredentialStatus } from '@/lib/types';
import { useLoad } from '@/lib/use-load';

type Filter = 'ALL' | CredentialStatus;

export default function AllCredentialsScreen() {
  const credentials = useLoad(fetchAdminCredentials);
  const [filter, setFilter] = useState<Filter>('ALL');

  const all = credentials.data ?? [];
  const count = (s: CredentialStatus) => all.filter((c) => c.status === s).length;
  const chips: Chip<Filter>[] = [
    { value: 'ALL', label: 'All', count: all.length },
    { value: 'ACTIVE', label: 'Active', count: count('ACTIVE') },
    { value: 'EXPIRED', label: 'Expired', count: count('EXPIRED') },
    { value: 'REVOKED', label: 'Revoked', count: count('REVOKED') },
  ];
  const shown = filter === 'ALL' ? all : all.filter((c) => c.status === filter);

  return (
    <Page title="Digital Cards" subtitle="Every credential issued to users" refreshing={credentials.refreshing} onRefresh={credentials.refresh}>
      <FilterChips chips={chips} selected={filter} onSelect={setFilter} />

      {credentials.loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : credentials.error ? (
        <LoadError state={credentials} />
      ) : shown.length === 0 ? (
        <Text style={styles.empty}>No cards match this filter.</Text>
      ) : (
        shown.map((c) => <CredentialRow key={c.credentialId} credential={c} />)
      )}
    </Page>
  );
}

function CredentialRow({ credential }: { credential: AdminCredential }) {
  return (
    <View style={styles.card}>
      <DocIcon type={credential.documentType} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {credential.holderName}
          </Text>
          <CredentialStatusBadge status={credential.status} />
        </View>
        <Text style={styles.type}>{documentTypeLabel(credential.documentType)}</Text>
        <Text style={styles.meta}>{credential.holderEmail}</Text>
        <Text style={styles.meta}>
          Issued {formatDate(credential.issuedAt)} · Valid until {formatDate(credential.validUntil)}
        </Text>
        <Text style={styles.code} selectable>
          {credential.verificationCode}
        </Text>
        {credential.status === 'REVOKED' && credential.revocationReason ? (
          <Text style={styles.revoked}>Revoked: {credential.revocationReason}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 20 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...cardShadow,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text, flexShrink: 1 },
  type: { fontSize: 14, color: colors.text },
  meta: { fontSize: 12, color: colors.muted },
  code: { fontSize: 11, color: colors.muted, fontFamily: 'monospace', marginTop: 4 },
  revoked: { fontSize: 13, color: colors.danger, marginTop: 4 },
});
