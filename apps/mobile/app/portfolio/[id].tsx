import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { LineChart } from '../../src/components/charts/LineChart';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { usePortfolioDetail } from '../../src/hooks/usePortfolio';
import { formatCFA, formatPercent } from '../../src/utils/format';
import type { PortfolioHolding } from '../../src/api/portfolios';

type Period = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

const periods: { key: Period; label: string }[] = [
  { key: '1W', label: '1S' },
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '6M', label: '6M' },
  { key: '1Y', label: '1A' },
  { key: 'ALL', label: 'Tout' },
];

export default function PortfolioDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [period, setPeriod] = useState<Period>('1M');

  const { data: portfolio, isLoading } = usePortfolioDetail(id ?? '', period);

  const isPositive = (portfolio?.totalGainLoss ?? 0) >= 0;

  const renderHolding = ({ item }: { item: PortfolioHolding }) => {
    const holdingPositive = item.gainLoss >= 0;
    return (
      <TouchableOpacity
        style={styles.holdingItem}
        onPress={() => router.push(`/asset/${item.assetId}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.holdingLeft}>
          <View style={styles.holdingIcon}>
            <Text style={styles.holdingInitials}>
              {item.assetName.slice(0, 2)}
            </Text>
          </View>
          <View>
            <View style={styles.holdingNameRow}>
              <Text style={styles.holdingName} numberOfLines={1}>
                {item.assetName}
              </Text>
              {item.isHalal && (
                <Badge label="Halal" variant="halal" size="sm" />
              )}
            </View>
            <Text style={styles.holdingType}>
              {item.assetType} — {Math.round(item.weight * 100)}%
            </Text>
          </View>
        </View>
        <View style={styles.holdingRight}>
          <Text style={styles.holdingValue}>
            {formatCFA(item.currentValue, { compact: true })}
          </Text>
          <Text
            style={[
              styles.holdingChange,
              { color: holdingPositive ? Colors.success : Colors.error },
            ]}
          >
            {formatPercent(item.gainLossPercent)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <Header title={portfolio?.name ?? 'Portefeuille'} showBack />

      {/* Summary card */}
      <Card style={styles.summaryCard} elevation="lg">
        <Text style={styles.totalValue}>
          {formatCFA(portfolio?.totalValue ?? 0)}
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
            {formatCFA(Math.abs(portfolio?.totalGainLoss ?? 0), { compact: true })}{' '}
            ({formatPercent(portfolio?.totalGainLossPercent ?? 0)})
          </Text>
        </View>
      </Card>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.periodButton,
              period === p.key && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(p.key)}
          >
            <Text
              style={[
                styles.periodText,
                period === p.key && styles.periodTextActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Performance chart */}
      {portfolio?.performance && portfolio.performance.length > 1 && (
        <View style={styles.chartWrap}>
          <LineChart
            data={portfolio.performance}
            color={isPositive ? Colors.success : Colors.error}
          />
        </View>
      )}

      {/* Holdings */}
      <View style={styles.holdingsHeader}>
        <Text style={styles.holdingsTitle}>Positions</Text>
        <Text style={styles.holdingsCount}>
          {portfolio?.holdings?.length ?? 0} actifs
        </Text>
      </View>

      {portfolio?.holdings?.map((holding) => (
        <View key={holding.assetId}>
          {renderHolding({ item: holding })}
        </View>
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    padding: Spacing['6'],
    marginBottom: Spacing['4'],
    backgroundColor: Colors.navy,
  },
  totalValue: {
    ...Typography.amountLarge,
    color: Colors.textInverse,
    marginBottom: Spacing['1'],
  },
  gainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gainText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing['4'],
    gap: Spacing['1'],
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing['2'],
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  periodButtonActive: {
    backgroundColor: `${Colors.primary}15`,
  },
  periodText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
  },
  periodTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  chartWrap: {
    marginBottom: Spacing['6'],
    alignItems: 'center',
  },
  holdingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  holdingsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  holdingsCount: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  holdingInitials: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.navy,
  },
  holdingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  holdingName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    maxWidth: 160,
  },
  holdingType: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  holdingRight: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  holdingChange: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },
});
