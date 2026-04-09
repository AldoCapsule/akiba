import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Card } from '../../src/components/ui/Card';
import { DonutChart } from '../../src/components/charts/DonutChart';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET, Shadows } from '../../src/constants/spacing';
import { usePortfolio } from '../../src/hooks/usePortfolio';
import { useAuthStore } from '../../src/store/auth.store';
import { formatCFA, formatPercent } from '../../src/utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  route: string;
}

const quickActions: QuickAction[] = [
  { id: 'invest', icon: 'trending-up', label: 'Investir', color: Colors.primary, route: '/(tabs)/markets' },
  { id: 'deposit', icon: 'add-circle', label: 'Déposer', color: Colors.info, route: '/deposit' },
  { id: 'withdraw', icon: 'arrow-down-circle', label: 'Retirer', color: Colors.gold, route: '/withdraw' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, t } = useAuthStore();
  const {
    walletBalance,
    totalValue,
    totalGainLoss,
    totalGainLossPercent,
    allocation,
    portfolios,
    isLoading,
    refreshAll,
  } = usePortfolio();

  const isPositive = totalGainLoss >= 0;
  const firstName = user?.fullName?.split(' ')[0] ?? '';

  // Build donut segments from allocation
  const donutSegments = allocation
    ? [
        { label: 'Actions', value: allocation.equities, color: Colors.chartEquities },
        { label: 'Obligations', value: allocation.bonds, color: Colors.chartBonds },
        { label: 'Sukuk', value: allocation.sukuk, color: Colors.chartSukuk },
        { label: 'Fonds', value: allocation.funds, color: Colors.chartFunds },
        { label: 'Espèces', value: allocation.cash, color: Colors.chartCash },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <ScreenWrapper onRefresh={refreshAll} refreshing={isLoading}>
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greeting}>
            {t('home.greeting')}{firstName ? `, ${firstName}` : ''} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            {t('home.totalBalance')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => {/* notifications */}}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Balance card */}
      <Card style={styles.balanceCard} elevation="lg">
        <Text style={styles.balanceAmount}>
          {formatCFA(
            (walletBalance?.total ?? 0) + totalValue,
            { compact: false },
          )}
        </Text>
        <View style={styles.gainRow}>
          <Ionicons
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={isPositive ? Colors.success : Colors.error}
          />
          <Text
            style={[
              styles.gainText,
              { color: isPositive ? Colors.success : Colors.error },
            ]}
          >
            {formatCFA(Math.abs(totalGainLoss), { compact: true })}{' '}
            ({formatPercent(totalGainLossPercent)})
          </Text>
        </View>
      </Card>

      {/* 3 Big Action Buttons — progressive disclosure, bottom 60% zone */}
      <View style={styles.actionsRow}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
              <Ionicons name={action.icon} size={28} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Portfolio allocation donut */}
      {donutSegments.length > 0 && (
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.allocationTitle')}</Text>
            <TouchableOpacity onPress={() => router.push('/portfolio/main' as any)}>
              <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <DonutChart
            segments={donutSegments}
            centerValue={formatCFA(totalValue, { compact: true, showCurrency: false })}
            centerLabel="FCFA"
          />
        </Card>
      )}

      {/* Portfolio summary */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.portfolio')}</Text>
          <TouchableOpacity onPress={() => router.push('/portfolio/main' as any)}>
            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        {portfolios.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pie-chart-outline" size={40} color={Colors.gray300} />
            <Text style={styles.emptyText}>
              Commencez à investir pour voir votre portefeuille ici.
            </Text>
            <TouchableOpacity
              style={styles.emptyAction}
              onPress={() => router.push('/(tabs)/markets')}
            >
              <Text style={styles.emptyActionText}>Explorer les marchés</Text>
            </TouchableOpacity>
          </View>
        ) : (
          portfolios.map((portfolio) => (
            <TouchableOpacity
              key={portfolio.id}
              style={styles.portfolioItem}
              onPress={() => router.push(`/portfolio/${portfolio.id}` as any)}
            >
              <View style={styles.portfolioInfo}>
                <Text style={styles.portfolioName}>{portfolio.name}</Text>
                <Text style={styles.portfolioValue}>
                  {formatCFA(portfolio.totalValue)}
                </Text>
              </View>
              <View style={styles.portfolioGain}>
                <Text
                  style={[
                    styles.portfolioGainText,
                    {
                      color:
                        portfolio.totalGainLoss >= 0
                          ? Colors.success
                          : Colors.error,
                    },
                  ]}
                >
                  {formatPercent(portfolio.totalGainLossPercent)}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.gray400}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </Card>

      {/* Wallet balance */}
      {walletBalance && (
        <Card style={styles.sectionCard}>
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.walletLabel}>Solde disponible</Text>
              <Text style={styles.walletAmount}>
                {formatCFA(walletBalance.available)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.depositMiniButton}
              onPress={() => router.push('/deposit')}
            >
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={styles.depositMiniText}>Déposer</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['2'],
  },
  greeting: {
    ...Typography.h3,
    color: Colors.navy,
  },
  greetingSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notifButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: MIN_TOUCH_TARGET / 2,
    backgroundColor: Colors.gray100,
  },
  balanceCard: {
    padding: Spacing['6'],
    marginBottom: Spacing['4'],
    backgroundColor: Colors.navy,
  },
  balanceAmount: {
    ...Typography.balanceDisplay,
    color: Colors.textInverse,
    marginBottom: Spacing['1'],
  },
  gainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['1'],
  },
  gainText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing['3'],
    marginBottom: Spacing['6'],
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing['4'],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2'],
  },
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sectionCard: {
    padding: Spacing['4'],
    marginBottom: Spacing['4'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['4'],
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['6'],
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing['3'],
    marginBottom: Spacing['4'],
  },
  emptyAction: {
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['2'],
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.full,
  },
  emptyActionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  portfolioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  portfolioInfo: {
    flex: 1,
  },
  portfolioName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  portfolioValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  portfolioGain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  portfolioGainText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  walletAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  depositMiniButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['1'],
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.full,
  },
  depositMiniText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
});
