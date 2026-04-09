import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { Input } from '../../src/components/ui/Input';
import { AmountPicker } from '../../src/components/ui/AmountPicker';
import { Button } from '../../src/components/ui/Button';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET } from '../../src/constants/spacing';
import { useAuthStore } from '../../src/store/auth.store';
import * as savingsApi from '../../src/api/savings';
import type { GoalType } from '../../src/api/savings';

type WizardStep = 'type' | 'details' | 'amount';

interface GoalTypeOption {
  type: GoalType;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const goalTypes: GoalTypeOption[] = [
  { type: 'emergency', icon: 'medkit', color: Colors.error },
  { type: 'hajj', icon: 'airplane', color: Colors.gold },
  { type: 'education', icon: 'school', color: Colors.info },
  { type: 'housing', icon: 'home', color: Colors.primary },
  { type: 'business', icon: 'briefcase', color: '#9B59B6' },
  { type: 'retirement', icon: 'sunny', color: '#E67E22' },
  { type: 'wedding', icon: 'heart', color: '#E91E63' },
  { type: 'custom', icon: 'flag', color: Colors.gray600 },
];

export default function CreateGoalScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useAuthStore();

  const [step, setStep] = useState<WizardStep>('type');
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(0);

  const createMutation = useMutation({
    mutationFn: savingsApi.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings', 'goals'] });
      Alert.alert(
        t('common.success'),
        'Votre objectif a été créé !',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    },
    onError: (error: any) => {
      Alert.alert(t('common.error'), error?.message ?? 'Création échouée.');
    },
  });

  const goalTypeLabels = t('goals.goalTypes') as unknown as Record<string, string>;

  const handleSelectType = (type: GoalType) => {
    setSelectedType(type);
    setName(goalTypeLabels[type] ?? '');
    setStep('details');
  };

  const handleDetailsNext = () => {
    if (!name.trim()) {
      Alert.alert('', 'Veuillez donner un nom à votre objectif.');
      return;
    }
    setStep('amount');
  };

  const handleCreate = () => {
    if (targetAmount < 1_000) {
      Alert.alert('', 'Le montant objectif doit être d\'au moins 1 000 FCFA.');
      return;
    }

    createMutation.mutate({
      name,
      type: selectedType ?? 'custom',
      targetAmount,
      monthlyContribution,
      deadline: deadline || new Date(Date.now() + 365 * 86400000).toISOString(),
    });
  };

  // Step 1: Choose goal type
  if (step === 'type') {
    return (
      <ScreenWrapper>
        <Header title={t('goals.createGoal')} showBack />
        <View style={styles.stepSection}>
          <Text style={styles.stepTitle}>Quel est votre objectif ?</Text>
          <Text style={styles.stepSubtitle}>
            Choisissez un type d'objectif pour commencer.
          </Text>
        </View>
        <View style={styles.typeGrid}>
          {goalTypes.map((gt) => (
            <TouchableOpacity
              key={gt.type}
              style={styles.typeCard}
              onPress={() => handleSelectType(gt.type)}
              activeOpacity={0.7}
            >
              <View style={[styles.typeIcon, { backgroundColor: `${gt.color}15` }]}>
                <Ionicons name={gt.icon} size={28} color={gt.color} />
              </View>
              <Text style={styles.typeLabel}>
                {goalTypeLabels[gt.type] ?? gt.type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScreenWrapper>
    );
  }

  // Step 2: Goal details
  if (step === 'details') {
    return (
      <ScreenWrapper avoidKeyboard>
        <Header
          title={t('goals.createGoal')}
          showBack
          onBack={() => setStep('type')}
        />
        <View style={styles.form}>
          <Input
            label="Nom de l'objectif"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Hajj 2027"
            autoFocus
          />
          <Input
            label="Date cible (optionnel)"
            value={deadline}
            onChangeText={setDeadline}
            placeholder="JJ/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>
        <View style={styles.formAction}>
          <Button title={t('common.next')} onPress={handleDetailsNext} />
        </View>
      </ScreenWrapper>
    );
  }

  // Step 3: Amount
  return (
    <ScreenWrapper avoidKeyboard>
      <Header
        title={t('goals.createGoal')}
        showBack
        onBack={() => setStep('details')}
      />
      <View style={styles.form}>
        <AmountPicker
          value={targetAmount}
          onChange={setTargetAmount}
          label={t('goals.targetAmount')}
          min={1_000}
        />
        <View style={styles.monthlySection}>
          <Text style={styles.monthlyLabel}>
            {t('goals.monthlyContribution')} (optionnel)
          </Text>
          <View style={styles.monthlyRow}>
            {[5_000, 10_000, 25_000, 50_000].map((amount) => {
              const isSelected = monthlyContribution === amount;
              return (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.monthlyChip,
                    isSelected && styles.monthlyChipSelected,
                  ]}
                  onPress={() => setMonthlyContribution(amount)}
                >
                  <Text
                    style={[
                      styles.monthlyChipText,
                      isSelected && styles.monthlyChipTextSelected,
                    ]}
                  >
                    {(amount / 1000).toFixed(0)}K
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
      <View style={styles.formAction}>
        <Button
          title="Créer l'objectif"
          onPress={handleCreate}
          loading={createMutation.isPending}
          disabled={targetAmount < 1_000}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  stepSection: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['6'],
  },
  stepTitle: {
    ...Typography.h3,
    color: Colors.navy,
    marginBottom: Spacing['2'],
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing['4'],
    gap: Spacing['3'],
  },
  typeCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: Spacing['5'],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2'],
  },
  typeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: Spacing['4'],
    flex: 1,
  },
  formAction: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['6'],
  },
  monthlySection: {
    marginTop: Spacing['4'],
  },
  monthlyLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing['3'],
  },
  monthlyRow: {
    flexDirection: 'row',
    gap: Spacing['2'],
  },
  monthlyChip: {
    flex: 1,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  monthlyChipSelected: {
    backgroundColor: `${Colors.primary}10`,
    borderColor: Colors.primary,
  },
  monthlyChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  monthlyChipTextSelected: {
    color: Colors.primary,
  },
});
