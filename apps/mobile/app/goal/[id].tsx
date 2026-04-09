import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { useAuthStore } from '../../src/store/auth.store';
import * as savingsApi from '../../src/api/savings';
import { formatCFA, formatDate, formatRelativeTime } from '../../src/utils/format';

const goalIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  emergency: 'medkit',
  hajj: 'airplane',
  education: 'school',
  housing: 'home',
  business: 'briefcase',
  retirement: 'sunny',
  wedding: 'heart',
  custom: 'flag',
};

const goalColors: Record<string, string> = {
  emergency: Colors.error,
  hajj: Colors.gold,
  education: Colors.info,
  housing: Colors.primary,
  business: '#9B59B6',
  retirement: '#E67E22',
  wedding: '#E91E63',
  custom: Colors.gray600,
};

export default function GoalDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useAuthStore();

  const { data: goal, isLoading } = useQuery({
    queryKey: ['savings', 'goals', id],
    queryFn: () => savingsApi.getGoal(id ?? ''),
    enabled: !!id,
    select: (res) => res.data,
  });

  const { data: contributions } = useQuery({
    queryKey: ['savings', 'goals', id, 'contributions'],
    queryFn: () => savingsApi.getGoalContributions(id ?? ''),
    enabled: !!id,
    select: (res) => res.data,
  });

  const contributeMutation = useMutation({
    mutationFn: (amount: number) => savingsApi.contributeToGoal(id ?? '', amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings', 'goals', id] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  const icon = goalIcons[goal?.type ?? 'custom'] ?? 'flag';
  const color = goalColors[goal?.type ?? 'custom'] ?? Colors.primary;
  const remaining = (goal?.targetAmount ?? 0) - (goal?.currentAmount ?? 0);

  const handleContribute = () => {
    Alert.prompt?.(
      'Contribuer',
      `Montant à ajouter (max: ${formatCFA(remaining)})`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: (text) => {
            const amount = parseInt(text ?? '0', 10);
            if (amount >= 1_000) {
              contributeMutation.mutate(amount);
            }
          },
        },
      ],
      'plain-text',
      '',
      'number-pad',
    );
  };

  if (!goal) {
    return (
      <ScreenWrapper>
        <Header title="" showBack />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header title="" showBack />

      {/* Goal header */}
      <View style={styles.goalHeader}>
        <View style={[styles.goalIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={36} color={color} />
        </View>
        <Text style={styles.goalName}>{goal.name}</Text>
        <Text style={styles.goalDeadline}>
          Objectif: {formatDate(goal.deadline)}
        </Text>
      </View>

      {/* Progress */}
      <Card style={styles.progressCard}>
        <ProgressBar
          progress={goal.progress}
          color={color}
          height={12}
          showLabel
          label={t('goals.progress')}
        />
        <View style={styles.amountsRow}>
          <View>
            <Text style={styles.amountLabel}>{t('goals.currentAmount')}</Text>
            <Text style={[styles.amountValue, { color }]}>
              {formatCFA(goal.currentAmount)}
            </Text>
          </View>
          <View style={styles.amountRight}>
            <Text style={styles.amountLabel}>{t('goals.targetAmount')}</Text>
            <Text style={styles.amountValue}>
              {formatCFA(goal.targetAmount)}
            </Text>
          </View>
        </View>
        {remaining > 0 && (
          <Text style={styles.remainingText}>
            Il reste {formatCFA(remaining)} à épargner
          </Text>
        )}
      </Card>

      {/* Monthly contribution */}
      {goal.monthlyContribution > 0 && (
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="sync-outline" size={20} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{t('goals.monthlyContribution')}</Text>
              <Text style={styles.infoValue}>
                {formatCFA(goal.monthlyContribution)}/mois
              </Text>
            </View>
          </View>
          {goal.autoInvest && (
            <View style={[styles.infoRow, { marginTop: Spacing['3'] }]}>
              <Ionicons name="trending-up" size={20} color={Colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Auto-investissement</Text>
                <Text style={[styles.infoValue, { color: Colors.primary }]}>
                  Activé
                </Text>
              </View>
            </View>
          )}
        </Card>
      )}

      {/* Recent contributions */}
      {contributions && contributions.length > 0 && (
        <Card style={styles.historyCard}>
          <Text style={styles.historyTitle}>Contributions récentes</Text>
          {contributions.slice(0, 5).map((c) => (
            <View key={c.id} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Ionicons
                  name={c.type === 'auto' ? 'sync' : 'add-circle'}
                  size={18}
                  color={c.type === 'auto' ? Colors.info : Colors.primary}
                />
                <Text style={styles.historyType}>
                  {c.type === 'auto' ? 'Automatique' : 'Manuelle'}
                </Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>
                  +{formatCFA(c.amount, { compact: true })}
                </Text>
                <Text style={styles.historyDate}>
                  {formatRelativeTime(c.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Action */}
      <View style={styles.action}>
        <Button
          title="Contribuer"
          onPress={handleContribute}
          loading={contributeMutation.isPending}
          icon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
  },
  goalHeader: {
    alignItems: 'center',
    paddingBottom: Spacing['6'],
  },
  goalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  goalName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  goalDeadline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  progressCard: {
    padding: Spacing['4'],
    marginBottom: Spacing['4'],
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing['4'],
  },
  amountRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  remainingText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing['3'],
    paddingTop: Spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  infoCard: {
    padding: Spacing['4'],
    marginBottom: Spacing['4'],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3'],
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  historyCard: {
    padding: Spacing['4'],
    marginBottom: Spacing['4'],
  },
  historyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing['3'],
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  historyType: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
  },
  historyDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  action: {
    paddingBottom: Spacing['4'],
  },
});
