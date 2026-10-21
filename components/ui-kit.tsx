import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { cardShadow, colors, radius } from '@/constants/colors';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Plain white page with a centred form. Used by the sign-in screen. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type HeaderScreenProps = {
  title: string;
  subtitle?: string;
  back?: boolean;
  children: ReactNode;
  /** Shown under the white card, e.g. "Already have an account? Log in". */
  footer?: ReactNode;
};

/** Navy header (back arrow, title) with the form on a white card that overlaps it. Used by Create account. */
export function HeaderScreen({ title, subtitle, back, children, footer }: HeaderScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <LinearGradient
            colors={[colors.navy, colors.navyMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hdr, { paddingTop: insets.top + 16 }]}>
            <View style={styles.hdrRow}>
              {back ? (
                <Pressable
                  onPress={() => {
                    if (router.canGoBack()) router.back();
                  }}
                  hitSlop={12}
                  accessibilityLabel="Go back">
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
              ) : null}
              <Text style={styles.hdrTitle}>{title}</Text>
            </View>
            {subtitle ? <Text style={styles.hdrSub}>{subtitle}</Text> : null}
          </LinearGradient>

          <View style={styles.sheet}>{children}</View>
          {footer ? <View style={styles.footerWrap}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type FieldProps = TextInputProps & { label: string; error?: string; icon?: IconName };

export function Field({ label, error, icon, style, onFocus, onBlur, secureTextEntry, ...inputProps }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused ? styles.inputFocused : null, error ? styles.inputError : null]}>
        {icon ? <Ionicons name={icon} size={19} color={focused ? colors.primary : colors.faint} /> : null}
        <TextInput
          placeholderTextColor={colors.faint}
          style={[styles.input, style]}
          secureTextEntry={isPassword && hidden}
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
        {isPassword ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

type Variant = 'primary' | 'secondary' | 'success' | 'danger';

const VARIANTS: Record<Variant, { bg: string; border: string; text: string }> = {
  primary: { bg: colors.primary, border: colors.primary, text: colors.primaryText },
  secondary: { bg: colors.card, border: colors.primary, text: colors.primary },
  success: { bg: colors.success, border: colors.success, text: '#FFFFFF' },
  danger: { bg: '#FFF5F5', border: colors.danger, text: colors.danger },
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
        variant === 'primary' || variant === 'success' ? styles.buttonGlow : null,
        pressed ? styles.buttonPressed : null,
        disabled && !loading ? { opacity: 0.5 } : null,
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
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '700' },
  section: { fontSize: 17, fontWeight: '800', color: colors.text },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 6 },
  hdr: { paddingHorizontal: 22, paddingBottom: 56, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  hdrRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  hdrTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  hdrSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20, marginTop: 10 },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: 22,
    marginHorizontal: 20,
    marginTop: -34,
    padding: 20,
    gap: 4,
    ...cardShadow,
  },
  footerWrap: { alignItems: 'center', paddingVertical: 22 },
  field: { marginTop: 12, gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md - 2,
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 16, color: colors.text },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 13 },
  button: {
    borderRadius: radius.md - 2,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonGlow: { boxShadow: '0 6px 14px rgba(29, 78, 216, 0.22)', elevation: 3 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  buttonText: { fontSize: 16, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: radius.md - 2 },
  bannerText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
