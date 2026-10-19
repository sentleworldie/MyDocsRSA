import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius } from '@/constants/colors';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Full-screen white page with a centred form. Used by the sign-in and register screens. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = TextInputProps & { label: string; error?: string };

export function Field({ label, error, style, onFocus, onBlur, ...inputProps }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        placeholderTextColor={colors.faint}
        style={[styles.input, focused ? styles.inputFocused : null, error ? styles.inputError : null, style]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...inputProps}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

type Variant = 'primary' | 'secondary' | 'success' | 'danger';

const VARIANTS: Record<Variant, { bg: string; border: string; text: string }> = {
  primary: { bg: colors.primary, border: colors.primary, text: colors.primaryText },
  secondary: { bg: colors.card, border: colors.primary, text: colors.primary },
  success: { bg: colors.success, border: colors.success, text: '#FFFFFF' },
  danger: { bg: colors.dangerBg, border: colors.danger, text: colors.danger },
};

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
};

export function Button({ title, onPress, loading, variant = 'primary', icon, disabled }: ButtonProps) {
  const v = VARIANTS[variant];
  const inactive = loading || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed || inactive ? styles.buttonPressed : null,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.buttonRow}>
          {icon ? <Ionicons name={icon} size={18} color={v.text} /> : null}
          <Text style={[styles.buttonText, { color: v.text }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

type BannerKind = 'error' | 'success' | 'info';

const BANNERS: Record<BannerKind, { bg: string; fg: string; icon: IconName }> = {
  error: { bg: colors.dangerBg, fg: colors.danger, icon: 'alert-circle' },
  success: { bg: colors.successBg, fg: colors.success, icon: 'checkmark-circle' },
  info: { bg: colors.infoBg, fg: colors.primary, icon: 'information-circle' },
};

export function Banner({ message, kind = 'error' }: { message: string; kind?: BannerKind }) {
  const b = BANNERS[kind];
  return (
    <View style={[styles.banner, { backgroundColor: b.bg }]}>
      <Ionicons name={b.icon} size={20} color={b.fg} />
      <Text style={[styles.bannerText, { color: b.fg }]}>{message}</Text>
    </View>
  );
}

export const textStyles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '700' },
  section: { fontSize: 17, fontWeight: '700', color: colors.text },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 6 },
  field: { marginTop: 14, gap: 6 },
  label: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.6 },
  input: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md - 2,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.text,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: '#FFFFFF' },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 13 },
  button: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonPressed: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: radius.md - 2,
  },
  bannerText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
