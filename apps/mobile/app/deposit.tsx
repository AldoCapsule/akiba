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
import { Card } from '../src/components/ui/Card';
import { Colors } from '../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../src/constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET } from '../src/constants/spacing';
import { useAuthStore } from '../src/store/auth.store';
import * as paymentsApi from '../src/api/payments';
import { validateAmount } from '../src/utils/validation';
import type { PaymentProvider } from '../src/api/payments';

interface ProviderOption {
  id: PaymentProvider;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
}

const providers: ProviderOption[] = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    icon: 'phone-portrait',
    color: '#FF6600',
    description: 'Paiement instantané',
  },
  {
    id: 'wave',
    name: 'Wave',
    icon: 'water',
    color: '#1DC7EA',
    description: 'Paiement instantané',
  },
  {
    id: 'free_money',
    name: 'Free Money',
    icon: 'phone-portrait-outline',
    color: '#E40046',
    description: 'Paiement instantané',
  },
  {
    id: 'bank_transfer',
    name: 'Virement bancaire',
    icon: 'business',
    color: Colors.navy,
    description: 'Traitement 1-2 jours',
  },
];

export default function DepositScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useAuthStore();

  const [amount, setAmount] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [amountError, setAmountError] = useState('');

  const depositMutation = useMutation({
    mutationFn: paymentsApi.deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      Alert.alert(
        t('common.success'),
        'Votre dépôt a été initié avec succès.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    },
    onError: (error: any) => {
      Alert.alert(t('common.error'), error?.message ?? 'Le dépôt a échoué.');
    },
  });

  const handleDeposit = () => {
    const validation = validateAmount(amount, { min: 1_000 });
    if (!validation.valid) {
      setAmountError(validation.error!);
      return;
    }
    if (!selectedProvider) return;

    setAmountError('');
    depositMutation.mutate({
      amount,
      provider: selectedProvider,
    });
  };

  return (
    <ScreenWrapper avoidKeyboard>
      <Header title={t('deposit.title')} showBack onBack={() => router.back()} />

      {/* Amount picker */}
      <View style={styles.section}>
        <AmountPicker
          value={amount}
          onChange={(v) => {
            setAmount(v);
            setAmountError('');
          }}
          label={t('deposit.amount')}
          error={amountError}
        />
      </View>

      {/* Payment source */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('deposit.source')}</Text>
        <View style={styles.providerList}>
          {providers.map((provider) => {
            const isSelected = selectedProvider === provider.id;
            return (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerCard,
                  isSelected && styles.providerCardSelected,
                ]}
                onPress={() => setSelectedProvider(provider.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.providerIcon,
                    { backgroundColor: `${provider.color}15` },
                  ]}
                >
                  <Ionicons
                    name={provider.icon}
                    size={22}
                    color={provider.color}
                  />
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerDesc}>{provider.description}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    isSelected && styles.radioSelected,
                  ]}
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
        <Text style={styles.hint}>{t('deposit.processingTime')}</Text>
        <Button
          title={t('deposit.confirmDeposit')}
          onPress={handleDeposit}
          loading={depositMutation.isPending}
          disabled={amount < 1_000 || !selectedProvider}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
  providerList: {
    gap: Spacing['2'],
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing['3'],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    minHeight: MIN_TOUCH_TARGET + 8,
  },
  providerCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}06`,
  },
  providerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  providerDesc: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 1,
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
