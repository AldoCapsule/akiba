import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { Button } from '../../src/components/ui/Button';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET } from '../../src/constants/spacing';
import { useAuth } from '../../src/hooks/useAuth';
import { formatPhoneNumber } from '../../src/utils/format';

const OTP_LENGTH = 6;
const RESEND_DELAY_SECONDS = 60;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { verifyOtp, isVerifyingOtp, requestOtp, isRequestingOtp, pendingPhone, t } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(RESEND_DELAY_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste — distribute digits across fields
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Veuillez entrer le code complet.');
      return;
    }

    setError('');
    try {
      await verifyOtp(code);
      // Navigate to KYC if new user, or to home if returning user
      router.replace('/(auth)/kyc');
    } catch (err: any) {
      setError(err?.message ?? 'Code invalide. Réessayez.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await requestOtp(pendingPhone!);
      setResendCountdown(RESEND_DELAY_SECONDS);
      setError('');
    } catch {
      setError('Impossible de renvoyer le code. Réessayez.');
    }
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <ScreenWrapper avoidKeyboard scrollable={false}>
      <Header title="" showBack />

      <View style={styles.content}>
        <View style={styles.top}>
          <View style={styles.iconWrap}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{t('auth.otpTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.otpSubtitle')}{' '}
            <Text style={styles.phone}>
              {pendingPhone ? formatPhoneNumber(pendingPhone) : ''}
            </Text>
          </Text>
        </View>

        {/* OTP input boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : undefined,
                error ? styles.otpInputError : undefined,
              ]}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={index === 0 ? OTP_LENGTH : 1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Resend */}
        <View style={styles.resendRow}>
          {resendCountdown > 0 ? (
            <Text style={styles.resendTimer}>
              {t('auth.resendIn')} {resendCountdown}s
            </Text>
          ) : (
            <Button
              title={t('auth.resendOtp')}
              variant="ghost"
              size="sm"
              onPress={handleResend}
              loading={isResendingOtp}
              fullWidth={false}
            />
          )}
        </View>

        {/* Bottom action */}
        <View style={styles.bottom}>
          <Button
            title={t('auth.verifyOtp')}
            onPress={handleVerify}
            loading={isVerifyingOtp}
            disabled={!isComplete}
          />
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
    marginBottom: Spacing['2'],
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  phone: {
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['2'],
    paddingTop: Spacing['8'],
  },
  otpInput: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET + 8,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray100,
    borderWidth: 1.5,
    borderColor: 'transparent',
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  otpInputError: {
    borderColor: Colors.error,
    backgroundColor: `${Colors.error}08`,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing['3'],
  },
  resendRow: {
    alignItems: 'center',
    paddingTop: Spacing['4'],
  },
  resendTimer: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  bottom: {
    paddingBottom: Spacing['6'],
  },
});
