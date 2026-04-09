import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../src/constants/spacing';
import { usePortfolio } from '../../src/hooks/usePortfolio';
import { useAuthStore } from '../../src/store/auth.store';
import { formatCFA, formatDate } from '../../src/utils/format';
import type { SavingsGoal } from '../../src/api/savings';

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

export default function GoalsScreen() {
  const router = useRouter();
  const { t } = useAuthStore();
  const { goals, isLoadingGoals, refreshAll } = usePortfolio();

  const renderGoalCard = ({ item }: { item: SavingsGoal }) => {
    const icon = goalIcons[item.type] ?? 'flag';
    const color = goalColors[item.type] ?? Colors.primary;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/goal/${item.id}` as any)}
        activeOpacity={0.8}
      >
        <Card style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={[styles.goalIcon, { backgroundColor: `${color}15` }]}>
              <Ionicons name={icon} size={22} color={color} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{item.name}</Text>
              <Text style={styles.goalDeadline}>
                {t('goals.deadline')}: {formatDate(item.deadline)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </View>

          <ProgressBar
            progress={item.progress}
            color={color}
            showLabel
            style={styles.goalProgress}
          />

          <View style={styles.goalAmounts}>
            <View>
              <Text style={styles.amountLabel}>{t('goals.currentAmount')}</Text>
              <Text style={styles.amountValue}>
                {formatCFA(item.currentAmount, { compact: true })}
              </Text>
            </View>
            <View style={styles.amountRight}>
              <Text style={styles.amountLabel}>{t('goals.targetAmount')}</Text>
              <Text style={styles.amountValue}>
                {formatCFA(item.targetAmount, { compact: true })}
              </Text>
            </View>
          </View>

          {item.monthlyContribution > 0 && (
            <View style={styles.monthlyRow}>
              <Ionicons name="sync-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.monthlyText}>
                {formatCFA(item.monthlyContribution)}/mois
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper noPadding scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('goals.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/goal/create')}
        >
          <Ionicons name="add" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Goals list */}
      <FlatList
        data={goals}
        renderItem={renderGoalCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="flag-outline" size={56} color={Colors.gray300} />
            </View>
            <Text style={styles.emptyTitle}>Aucun objectif</Text>
            <Text style={styles.emptyDesc}>
              {t('goals.noGoals')}
            </Text>
            <Button
              title={t('goals.createGoal')}
              onPress={() => router.push('/goal/create')}
              size="md"
              fullWidth={false}
              style={styles.emptyButton}
            />
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['4'],
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['20'],
    gap: Spacing['3'],
  },
  goalCard: {
    padding: Spacing['4'],
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  goalDeadline: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  goalProgress: {
    marginBottom: Spacing['3'],
  },
  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 1,
  },
  amountValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  monthlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['1'],
    marginTop: Spacing['3'],
    paddingTop: Spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  monthlyText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['16'],
    paddingHorizontal: Spacing['8'],
  },
  emptyIcon: {
    marginBottom: Spacing['4'],
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing['2'],
  },
  emptyDesc: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing['6'],
  },
  emptyButton: {
    paddingHorizontal: Spacing['8'],
  },
});
