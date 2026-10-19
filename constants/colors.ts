// MyDocs RSA design tokens (royal blue, light surfaces, green/amber/red status colours)
export const colors = {
  primary: '#1D4ED8',
  primaryDark: '#1E3A8A',
  primarySoft: '#DBEAFE',
  primaryText: '#FFFFFF',
  background: '#F4F6FB',
  card: '#FFFFFF',
  cardTint: '#EEF3FB',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  faint: '#94A3B8',
  danger: '#B91C1C',
  dangerBg: '#FEE2E2',
  dangerBorder: '#FCA5A5',
  success: '#15803D',
  successBg: '#DCFCE7',
  warn: '#B45309',
  warnBg: '#FEF3C7',
  infoBg: '#DBEAFE',
};

export const radius = { sm: 10, md: 14, lg: 20 };

/** Soft shadow used on cards (elevation covers Android, boxShadow the rest). */
export const cardShadow = {
  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.08)',
  elevation: 1,
} as const;
