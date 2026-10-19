import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { IconName } from '@/components/ui-kit';
import type { DocumentType } from '@/lib/types';

export const DOC_COLORS: Record<DocumentType, string> = {
  ID_DOCUMENT: '#1D4ED8',
  DRIVERS_LICENSE: '#0F766E',
  PROOF_OF_RESIDENCE: '#7C3AED',
  ACADEMIC_CERTIFICATE: '#B45309',
  PROFESSIONAL_DRIVERS_PERMIT: '#BE123C',
};

const DOC_ICONS: Record<DocumentType, IconName> = {
  ID_DOCUMENT: 'card-outline',
  DRIVERS_LICENSE: 'car-outline',
  PROOF_OF_RESIDENCE: 'home-outline',
  ACADEMIC_CERTIFICATE: 'school-outline',
  PROFESSIONAL_DRIVERS_PERMIT: 'bus-outline',
};

/** A rounded tile with an icon that matches the document type. */
export function DocIcon({ type, size = 46 }: { type: DocumentType; size?: number }) {
  const color = DOC_COLORS[type] ?? '#1D4ED8';
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
      <Ionicons name={DOC_ICONS[type] ?? 'document-text-outline'} size={size * 0.52} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
