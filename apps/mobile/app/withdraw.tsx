import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '../src/components/layout/ScreenWrapper';
import { Header } from '../src/components/layout/Header';
import { AmountPicker } from '../src/components/ui/AmountPicker';
import { Button } from '../src/components/ui/Button';
import { Colors } from '../src/constants/colors';
import { FontSize, FontWeight } from '../src/constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET } from '../src/constants/spacing';
import { useAuthStore } from '../src/store/auth.store';
import { usePortfolioStore } from '../src/store/portfolio.store';
import * as paymentsApi from '../src/api/payments';
import { formatCFA } from '../src/utils/format';
import { validateAmount } from '../src/utils/validation';
import type { PaymentProvider } from '../src/api/payments';

interface DestinationOption {
  id: PaymentProvider;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const destinations: DestinationOption[] = [
  { id: 'orange_money', name: 'Orange Money', icon: 'phone-portrait', color: '#FF6600' },
  { id: 'wave', name: 'Wave', icon: 'water', color: '#1DC7EA' },
  { id: 'free_money', name: 'Free Money', icon: 'phone-portrait-outline', color: '#E40046' },
  { id: 'bank_transfer', name: 'Virement bancaire', icon: 'business', color: Colors.navy },
];

export default function WithdrawScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useAuthStore();
  const walletBalance = usePortfolioStore((s) => s.walletBalance);

  const availableBalance = walletBalance?.available ?? 0;

  const [amount, setAmount] = useState(0);
  const [selectedDest, setSelectedDest] = useState<PaymentProvider | null>(null);
  const [amountError, setAmountError] = useState('');

  const withdrawMutation = useMutation({
    mutationFn: paymentsApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      Alert.alert(
        t('common.success'),
        'Votre retrait a été initié. Traitement sous 24h.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    },
    onError: (error: any) => {
      Alert.alert(t('common.error'), error?.message ?? 'Le retrait a échoué.');
    },
  });

  const handleWithdraw = () => {
    const validation = validateAmount(amount, { min: 1_000, max: availableBalance });
    if (!validation.valid) {
      setAmountError(validation.error!);
      return;
    }
    if (!selectedDest) return;

    setAmountError('');
    withdrawMutation.mutate({
      amount,
      provider: selectedDest,
      providerReference: '', // In real app, prompt for phone/account
    });
  };

  return (
    <ScreenWrapper avoidKeyboard>
      <Header title={t('withdraw.title')} showBack onBack={() => router.back()} />

      {/* Available balance */}
      <View style={styles.balanceBar}>
        <Text style={styles.balanceLabel}>{t('withdraw.availableBalance')}</Text>
        <Text style={styles.balanceValue}>{formatCFA(availableBalance)}</Text>
      </View>

      {/* Amount picker */}
      <View style={styles.section}>
        <AmountPicker
          value={amount}
          onChange={(v) => {
            setAmount(v);
            setAmountError('');
          }}
          label={t('withdraw.amount')}
          max={availableBalance}
          error={amountError}
        />
      </View>

      {/* Destination */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('withdraw.destination')}</Text>
        <View style={styles.destList}>
          {destinations.map((dest) => {
            const isSelected = selectedDest === dest.id;
            return (
              <TouchableOpacity
                key={dest.id}
                style={[
                  styles.destCard,
                  isSelected && styles.destCardSelected,
                ]}
                onPress={() => setSelectedDest(dest.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.destIcon,
                    { backgroundColor: `${dest.color}15` },
                  ]}
                >
                  <Ionicons name={dest.icon} size={22} color={dest.color} />
                </View>
                <Text style={styles.destName}>{dest.name}</Text>
                <View
                  style={[styles.radio, isSelected && styles.radioSelected]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Confirm */}
      <View style={styles.bottomAction}>
        <Text style={styles.hint}>{t('withdraw.processingTime')}</Text>
        <Button
          title={t('withdraw.confirmWithdraw')}
          onPress={handleWithdraw}
          loading={withdrawMutation.isPending}
          disabled={amount < 1_000 || !selectedDest}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  balanceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing['4'],
    marginBottom: Spacing['4'],
    padding: Spacing['4'],
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.lg,
  },
  balanceLabel: {
    fontSize: FontSize.sm,
    color: Colors.gray400,
  },
  balanceValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  section: {
    paddingHorizontal: Spacing['4'],
    marginBottom: Spacing['4'],
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing['3'],
  },
  destList: {
    gap: Spacing['2'],
  },
  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing['3'],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    minHeight: MIN_TOUCH_TARGET + 4,
  },
  destCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}06`,
  },
  destIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  destName: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.gray400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  bottomAction: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['6'],
    marginTop: 'auto',
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing['3'],
  },
});
