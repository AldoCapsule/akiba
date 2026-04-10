import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinInput } from '../../src/components/ui/PinInput';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize } from '../../src/constants/fonts';
import { Spacing } from '../../src/constants/spacing';

type Step = 'create' | 'confirm' | 'success';

export default function SetPinScreen() {
  const router = useRouter();
  const { setPin } = useAuth();
  const [step, setStep] = useState<Step>('create');
  const [pin, setStoredPin] = useState('');
  const [error, setError] = useState(false);

  const handleCreate = (code: string) => {
    setStoredPin(code);
    setStep('confirm');
  };

  const handleConfirm = async (code: string) => {
    if (code !== pin) {
      setError(true);
      setTimeout(() => setError(false), 500);
      return;
    }

    try {
      await setPin(code);
      setStep('success');
    } catch {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          <Text style={styles.successTitle}>PIN créé avec succès</Text>
          <Text style={styles.successSubtitle}>
            Votre compte est sécurisé. Vous pouvez maintenant accéder à Akiba.
          </Text>
        </View>
        <View style={styles.bottomAction}>
          <Button title="Continuer" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={step === 'create' ? 'lock-closed' : 'shield-checkmark'}
              size={32}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.title}>
            {step === 'create' ? 'Créez votre PIN' : 'Confirmez votre PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'create'
              ? 'Choisissez un code à 6 chiffres pour sécuriser votre compte.'
              : 'Saisissez à nouveau votre code PIN.'}
          </Text>
        </View>

        <PinInput
          key={step}
          length={6}
          secure
          onComplete={step === 'create' ? handleCreate : handleConfirm}
          error={error}
          autoFocus
        />

        {error && (
          <Text style={styles.errorText}>
            Les codes ne correspondent pas. Réessayez.
          </Text>
        )}
      </View>

      {step === 'confirm' && (
        <View style={styles.bottomAction}>
          <Button
            title="Retour"
            variant="ghost"
            onPress={() => { setStep('create'); setError(false); }}
          />
        </View>
      )}
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['10'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['4'],
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: Spacing['2'],
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing['4'],
  },
  bottomAction: {
    paddingHorizontal: Spacing['6'],
    paddingBottom: Spacing['4'],
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['6'],
    gap: Spacing['4'],
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.navy,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
