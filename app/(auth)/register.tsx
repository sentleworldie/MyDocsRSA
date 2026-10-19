import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { Banner, Button, Field, Screen, textStyles } from '@/components/ui-kit';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Same rules as the backend (RegisterRequest) so people get instant feedback
  function validate() {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address';
    if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    return errors;
  }

  async function handleRegister() {
    const errors = validate();
    setFieldErrors(errors);
    setError('');
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await register({ fullName, email, password, phoneNumber });
    } catch (e) {
      if (e instanceof ApiError) {
        setFieldErrors(e.fieldErrors ?? {});
        setError(e.message);
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <BrandMark compact />
      <Text style={styles.heading}>Create your account</Text>
      <Text style={styles.sub}>Register to certify and verify your documents</Text>

      <Field label="Full name" value={fullName} onChangeText={setFullName} error={fieldErrors.fullName} placeholder="Your full name" />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <Field
        label="Phone number (optional)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        error={fieldErrors.phoneNumber}
        keyboardType="phone-pad"
        placeholder="0XX XXX XXXX"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        secureTextEntry
        placeholder="At least 8 characters"
      />

      {error ? (
        <View style={styles.gap}>
          <Banner message={error} />
        </View>
      ) : null}

      <View style={styles.gap}>
        <Button title="Create Account" onPress={handleRegister} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={{ color: colors.muted }}>Already registered?</Text>
        <Link href="./login" style={textStyles.link}>
          Log In
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: 4 },
  sub: { fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: 4 },
  gap: { marginTop: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 22 },
});
