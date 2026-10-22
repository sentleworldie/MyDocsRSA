import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { Banner, Button, Field, Screen, textStyles } from '@/components/ui-kit';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // No manual navigation needed: the root layout sends each role to its own area.
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen hero={<BrandMark headline={'Your documents.\nVerified. Always with you.'} />}>
      <Text style={textStyles.title}>Welcome back</Text>
      <Text style={styles.sub}>Log in to see your verified documents.</Text>

      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" />

      {error ? (
        <View style={styles.gap}>
          <Banner message={error} />
        </View>
      ) : null}

      <View style={styles.gap}>
        <Button title="Log in" onPress={handleLogin} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={{ color: colors.muted }}>New to MyDocs RSA?</Text>
        <Link href="./register" style={textStyles.link}>
          Create an account
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 15, color: colors.muted, marginTop: 2, marginBottom: 4 },
  gap: { marginTop: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 22 },
});
