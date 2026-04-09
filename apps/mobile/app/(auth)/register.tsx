import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing } from '../../src/constants/spacing';
import { useAuth } from '../../src/hooks/useAuth';
import { validatePhoneNumber } from '../../src/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isRegistering, t } = useAuth();
  const [phone, setPhone] = useState('+221 ');
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const validation = validatePhoneNumber(phone);
    if (!validation.valid) {
      setError(validation.error ?? 'Numéro invalide');
      return;
    }

    setError('');
    try {
      await register(phone);
      router.push('/(auth)/verify-otp');
    } catch (err: any) {
      setError(err?.message ?? 'Une erreur est survenue. Réessayez.');
    }
  };

  return (
    <ScreenWrapper avoidKeyboard scrollable={false}>
      <Header title="" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        {/* Top section */}
        <View style={styles.top}>
          <View style={styles.iconWrap}>
            <Ionicons name="phone-portrait-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{t('auth.phoneNumber')}</Text>
          <Text style={styles.subtitle}>
            Entrez votre numéro de téléphone pour créer votre compte ou vous connecter.
          </Text>
        </View>

        {/* Form — placed in middle so action buttons stay in bottom zone */}
        <View style={styles.form}>
          <Input
            label={t('auth.phoneNumber')}
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (error) setError('');
            }}
            placeholder={t('auth.phonePlaceholder')}
            keyboardType="phone-pad"
            autoFocus
            maxLength={18}
            error={error}
            leftIcon={
              <Text style={styles.flag}>🇸🇳</Text>
            }
          />
        </View>

        {/* Bottom action zone */}
        <View style={styles.bottom}>
          <Button
            title={t('auth.sendOtp')}
            onPress={handleSendOtp}
            loading={isRegistering}
            disabled={phone.replace(/\D/g, '').length < 9}
          />
          <Text style={styles.terms}>
            En continuant, vous acceptez nos{' '}
            <Text style={styles.link}>Conditions d'utilisation</Text> et notre{' '}
            <Text style={styles.link}>Politique de confidentialité</Text>.
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing['4'],
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'center',
    paddingTop: Spacing['8'],
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['4'],
  },
  title: {
    ...Typography.h3,
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: Spacing['2'],
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing['4'],
  },
  form: {
    paddingTop: Spacing['8'],
  },
  flag: {
    fontSize: 20,
  },
  bottom: {
    paddingBottom: Spacing['6'],
    gap: Spacing['4'],
  },
  terms: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    color: Colors.textLink,
    fontWeight: FontWeight.medium,
  },
});
