// MyDocs RSA design tokens: deep navy headers, royal-blue actions, white cards on a soft blue-grey page,
// and clear green / orange / red status colours. Key names are unchanged from the original file.
export const colors = {
  primary: '#1D4ED8',
  primaryDark: '#1E3A8A',
  primarySoft: '#DBEAFE',
  primaryText: '#FFFFFF',

  navy: '#0B1E5B', // headers, splash
  navyMid: '#15358F',

  background: '#F4F7FD',
  card: '#FFFFFF',
  cardTint: '#EEF3FB',
  border: '#E3E9F5',

  text: '#0F172A',
  muted: '#64748B',
  faint: '#94A3B8',

  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  dangerBorder: '#FCA5A5',
  success: '#15803D',
  successBg: '#DCFCE7',
  warn: '#C2410C',
  warnBg: '#FFEDD5',
  info: '#1D4ED8',
  infoBg: '#DBEAFE',
};

export const radius = { sm: 10, md: 14, lg: 20 };

/** Soft blue-tinted shadow used on cards (elevation covers Android, boxShadow the rest). */
export const cardShadow = {
  boxShadow: '0 4px 16px rgba(15, 35, 95, 0.08)',
  elevation: 2,
} as const;
