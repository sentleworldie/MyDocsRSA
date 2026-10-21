import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Field, HeaderScreen, textStyles } from '@/components/ui-kit';
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
    <HeaderScreen
      title="Create account"
      subtitle="Join MyDocs RSA and keep your important documents safe."
      back
      footer={
        <View style={styles.footer}>
          <Text style={{ color: colors.muted }}>Already have an account?</Text>
          <Link href="./login" style={textStyles.link}>
            Login
          </Link>
        </View>
      }>
      <Field label="Full name" icon="person-outline" value={fullName} onChangeText={setFullName} error={fieldErrors.fullName} placeholder="Enter your full name" />
      <Field
        label="Email address"
        icon="mail-outline"
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
        icon="call-outline"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        error={fieldErrors.phoneNumber}
        keyboardType="phone-pad"
        placeholder="+27 12 345 6789"
      />
      <Field
        label="Password"
        icon="lock-closed-outline"
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
        <Button title="Register" onPress={handleRegister} loading={loading} />
      </View>
    </HeaderScreen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
});
