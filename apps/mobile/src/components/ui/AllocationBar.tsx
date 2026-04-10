import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface AllocationBarProps {
  segments: Segment[];
  height?: number;
}

export function AllocationBar({ segments, height = 12 }: AllocationBarProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const active = segments.filter((s) => s.value > 0);

  return (
    <View>
      <View style={[styles.bar, { height, borderRadius: height / 2 }]}>
        {active.map((segment, i) => (
          <View
            key={segment.label}
            style={{
              flex: segment.value,
              backgroundColor: segment.color,
              borderTopLeftRadius: i === 0 ? height / 2 : 0,
              borderBottomLeftRadius: i === 0 ? height / 2 : 0,
              borderTopRightRadius: i === active.length - 1 ? height / 2 : 0,
              borderBottomRightRadius: i === active.length - 1 ? height / 2 : 0,
            }}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {active.map((segment) => (
          <View key={segment.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <Text style={styles.legendLabel}>{segment.label}</Text>
            <Text style={styles.legendValue}>{Math.round((segment.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: Colors.gray100,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing['3'],
    gap: Spacing['3'],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['1'],
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  legendValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});
