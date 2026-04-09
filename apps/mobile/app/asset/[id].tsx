import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { LineChart } from '../../src/components/charts/LineChart';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../src/constants/spacing';
import * as marketsApi from '../../src/api/markets';
import { formatCFA, formatPercent, formatDate } from '../../src/utils/format';

type Period = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

const periods: { key: Period; label: string }[] = [
  { key: '1D', label: '1J' },
  { key: '1W', label: '1S' },
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '1Y', label: '1A' },
  { key: 'ALL', label: 'Tout' },
];

export default function AssetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [period, setPeriod] = useState<Period>('1M');

  const { data: asset, isLoading } = useQuery({
    queryKey: ['markets', 'asset', id, period],
    queryFn: () => marketsApi.getAsset(id ?? '', period),
    enabled: !!id,
    staleTime: 30_000,
    select: (res) => res.data,
  });

  const isPositive = (asset?.changePercent ?? 0) >= 0;

  const chartData = (asset?.priceHistory ?? []).map((p) => ({
    date: p.date,
    value: p.close,
  }));

  const handleInvest = () => {
    // In production, navigate to an invest flow with the asset pre-selected
    Alert.alert(
      'Investir',
      `Investir dans ${asset?.name ?? 'cet actif'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', onPress: () => router.push('/deposit') },
      ],
    );
  };

  return (
    <ScreenWrapper>
      <Header title={asset?.ticker ?? ''} showBack />

      {/* Asset info */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.assetName}>{asset?.name ?? ''}</Text>
          {asset?.isHalal && (
            <Badge label="Certifié Halal" variant="halal" size="md" />
          )}
        </View>
        <Text style={styles.assetType}>
          {asset?.type === 'equity' && 'Action'}
          {asset?.type === 'bond' && 'Obligation'}
          {asset?.type === 'sukuk' && 'Sukuk'}
          {asset?.type === 'fund' && 'Fonds'}
          {asset?.market ? ` — ${asset.market}` : ''}
          {asset?.issuer ? ` — ${asset.issuer}` : ''}
        </Text>
      </View>

      {/* Price card */}
      <Card style={styles.priceCard} elevation="lg">
        <Text style={styles.price}>{formatCFA(asset?.price ?? 0)}</Text>
        <View style={styles.changeRow}>
          <Ionicons
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size={18}
            color={isPositive ? Colors.success : Colors.error}
          />
          <Text
            style={[
              styles.changeText,
              { color: isPositive ? Colors.success : Colors.error },
            ]}
          >
            {formatCFA(Math.abs(asset?.changeAbsolute ?? 0))} (
            {formatPercent(asset?.changePercent ?? 0)})
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

      {/* Price chart */}
      {chartData.length > 1 && (
        <View style={styles.chartWrap}>
          <LineChart
            data={chartData}
            color={isPositive ? Colors.success : Colors.error}
          />
        </View>
      )}

      {/* Key stats */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Informations clés</Text>
        <View style={styles.statsGrid}>
          {asset?.marketCap !== undefined && (
            <StatRow label="Capitalisation" value={formatCFA(asset.marketCap, { compact: true })} />
          )}
          {asset?.volume24h !== undefined && (
            <StatRow label="Volume 24h" value={formatCFA(asset.volume24h, { compact: true })} />
          )}
          {asset?.high52w !== undefined && (
            <StatRow label="Plus haut 52s" value={formatCFA(asset.high52w)} />
          )}
          {asset?.low52w !== undefined && (
            <StatRow label="Plus bas 52s" value={formatCFA(asset.low52w)} />
          )}
          {asset?.dividendYield !== undefined && (
            <StatRow label="Rendement div." value={formatPercent(asset.dividendYield)} />
          )}
          {asset?.peRatio !== undefined && (
            <StatRow label="P/E Ratio" value={asset.peRatio.toFixed(1)} />
          )}
          {asset?.couponRate !== undefined && (
            <StatRow label="Taux coupon" value={formatPercent(asset.couponRate)} />
          )}
          {asset?.maturityDate && (
            <StatRow label="Maturité" value={formatDate(asset.maturityDate)} />
          )}
          {asset?.nav !== undefined && (
            <StatRow label="VNI" value={formatCFA(asset.nav)} />
          )}
          {asset?.expenseRatio !== undefined && (
            <StatRow label="Frais de gestion" value={formatPercent(asset.expenseRatio)} />
          )}
        </View>
      </Card>

      {/* Description */}
      {asset?.description && (
        <Card style={styles.descCard}>
          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.descText}>{asset.description}</Text>
        </Card>
      )}

      {/* Invest button — pinned to bottom zone */}
      <View style={styles.investAction}>
        <Button
          title="Investir maintenant"
          onPress={handleInvest}
          icon={<Ionicons name="trending-up" size={20} color={Colors.textInverse} />}
        />
      </View>
    </ScreenWrapper>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoSection: {
    marginBottom: Spacing['3'],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    marginBottom: Spacing['1'],
  },
  assetName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  assetType: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  priceCard: {
    padding: Spacing['5'],
    marginBottom: Spacing['4'],
  },
  price: {
    ...Typography.amountLarge,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
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
  statsCard: {
    padding: Spacing['4'],
    marginBottom: Spacing['4'],
  },
  statsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing['3'],
  },
  statsGrid: {},
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  descCard: {
    padding: Spacing['4'],
    marginBottom: Spacing['4'],
  },
  descTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing['2'],
  },
  descText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  investAction: {
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['4'],
  },
});
