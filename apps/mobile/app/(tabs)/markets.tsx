import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Badge } from '../../src/components/ui/Badge';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET, Shadows } from '../../src/constants/spacing';
import { useAuthStore } from '../../src/store/auth.store';
import * as marketsApi from '../../src/api/markets';
import { formatCFA, formatPercent } from '../../src/utils/format';
import type { Asset, AssetType } from '../../src/api/markets';

type TabFilter = 'all' | AssetType;

const tabs: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'equity', label: 'Actions' },
  { key: 'bond', label: 'Obligations' },
  { key: 'sukuk', label: 'Sukuk' },
  { key: 'fund', label: 'Fonds' },
];

export default function MarketsScreen() {
  const router = useRouter();
  const { t } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const assetsQuery = useQuery({
    queryKey: ['markets', 'assets', activeTab, searchQuery],
    queryFn: () =>
      marketsApi.getAssets({
        type: activeTab === 'all' ? undefined : activeTab,
        search: searchQuery || undefined,
      }),
    staleTime: 30_000,
  });

  const assets = assetsQuery.data?.data ?? [];

  const renderAssetItem = ({ item }: { item: Asset }) => {
    const isPositive = item.changePercent >= 0;

    return (
      <TouchableOpacity
        style={styles.assetItem}
        onPress={() => router.push(`/asset/${item.id}` as any)}
        activeOpacity={0.7}
      >
        {/* Left: icon + info */}
        <View style={styles.assetIcon}>
          <Text style={styles.assetTicker}>{item.ticker.slice(0, 2)}</Text>
        </View>
        <View style={styles.assetInfo}>
          <View style={styles.assetNameRow}>
            <Text style={styles.assetName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isHalal && (
              <Badge label="Halal" variant="halal" size="sm" />
            )}
          </View>
          <Text style={styles.assetTicker2}>{item.ticker}</Text>
        </View>

        {/* Right: price + change */}
        <View style={styles.assetPriceCol}>
          <Text style={styles.assetPrice}>{formatCFA(item.price)}</Text>
          <Text
            style={[
              styles.assetChange,
              { color: isPositive ? Colors.success : Colors.error },
            ]}
          >
            {formatPercent(item.changePercent)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper noPadding scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('markets.title')}</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item }) => {
            const isActive = activeTab === item.key;
            return (
              <TouchableOpacity
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(item.key)}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Asset list */}
      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color={Colors.gray300} />
            <Text style={styles.emptyText}>
              {assetsQuery.isLoading
                ? t('common.loading')
                : 'Aucun actif trouvé'}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['2'],
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
  },
  searchWrap: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing['3'],
    height: MIN_TOUCH_TARGET,
    gap: Spacing['2'],
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  tabsContainer: {
    marginBottom: Spacing['2'],
  },
  tabsContent: {
    paddingHorizontal: Spacing['4'],
    gap: Spacing['2'],
  },
  tab: {
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['2'],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textInverse,
  },
  listContent: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['20'],
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing['3'],
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  assetTicker: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.navy,
  },
  assetInfo: {
    flex: 1,
    marginRight: Spacing['2'],
  },
  assetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  assetName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  assetTicker2: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  assetPriceCol: {
    alignItems: 'flex-end',
  },
  assetPrice: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  assetChange: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.gray100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['16'],
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
    marginTop: Spacing['3'],
  },
});
