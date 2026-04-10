import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/ui/Input';
import { PinInput } from '../../src/components/ui/PinInput';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { normalizePhone } from '../../src/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length >= 9;

  const handlePhoneNext = () => {
    if (isPhoneValid) setShowPin(true);
  };

  const handleLogin = async (pin: string) => {
    try {
      const normalized = normalizePhone(phone.startsWith('+221') ? phone : `+221${phone}`);
      await login({ phone: normalized, pin });
      router.replace('/(tabs)');
    } catch {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoArea}>
          <Text style={styles.logo}>Akiba</Text>
        </View>

        <Text style={styles.title}>Bon retour !</Text>
        <Text style={styles.subtitle}>
          Connectez-vous avec votre numéro de téléphone et PIN.
        </Text>

        <View style={styles.phoneRow}>
          <View style={styles.prefix}>
            <Text style={styles.flag}>🇸🇳</Text>
            <Text style={styles.prefixText}>+221</Text>
          </View>
          <View style={styles.phoneInputWrap}>
            <Input
              placeholder="77 000 00 00"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => { setPhone(text); setShowPin(false); }}
            />
          </View>
        </View>

        {showPin && (
          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>Votre PIN à 6 chiffres</Text>
            <PinInput
              length={6}
              secure
              onComplete={handleLogin}
              error={pinError}
              autoFocus
            />
            {pinError && (
              <Text style={styles.errorText}>PIN incorrect. Réessayez.</Text>
            )}
          </View>
        )}

        {!showPin && (
          <Button
            title="Continuer"
            onPress={handlePhoneNext}
            disabled={!isPhoneValid}
            loading={isLoggingIn}
          />
        )}

        <TouchableOpacity
          style={styles.forgotLink}
          onPress={() => Alert.alert('PIN oublié', 'Contactez le support Akiba pour réinitialiser votre PIN.\n\nSupport: +221 33 800 00 00')}
        >
          <Text style={styles.forgotText}>PIN oublié ?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomLink}>
        <Text style={styles.bottomText}>Pas encore de compte ? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.bottomAction}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['6'],
    paddingTop: Spacing['10'],
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing['8'],
  },
  logo: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    marginBottom: Spacing['2'],
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['6'],
    lineHeight: 24,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    marginBottom: Spacing['4'],
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['1'],
    paddingHorizontal: Spacing['3'],
    height: 56,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
  },
  flag: {
    fontSize: 20,
  },
  prefixText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  phoneInputWrap: {
    flex: 1,
  },
  pinSection: {
    marginTop: Spacing['4'],
    marginBottom: Spacing['6'],
  },
  pinLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['4'],
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing['3'],
  },
  forgotLink: {
    alignItems: 'center',
    marginTop: Spacing['4'],
    padding: Spacing['2'],
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing['6'],
  },
  bottomText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  bottomAction: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
