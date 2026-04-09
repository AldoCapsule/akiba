import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';

type BadgeVariant = 'halal' | 'risk' | 'status' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  /** For risk variant: conservative | moderate | balanced | growth | aggressive */
  riskLevel?: string;
  /** For status variant */
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const riskColors: Record<string, string> = {
  conservative: Colors.info,
  moderate: '#2ECC71',
  balanced: Colors.gold,
  growth: '#E67E22',
  aggressive: Colors.error,
};

const statusColors: Record<string, { bg: string; text: string }> = {
  success: { bg: 'rgba(0, 168, 107, 0.1)', text: Colors.success },
  warning: { bg: 'rgba(245, 166, 35, 0.1)', text: Colors.warning },
  error: { bg: 'rgba(231, 76, 60, 0.1)', text: Colors.error },
  info: { bg: 'rgba(52, 152, 219, 0.1)', text: Colors.info },
  neutral: { bg: Colors.gray200, text: Colors.gray700 },
};

export function Badge({
  label,
  variant = 'info',
  riskLevel,
  status = 'neutral',
  size = 'sm',
  style,
}: BadgeProps) {
  if (variant === 'halal') {
    return (
      <View style={[styles.badge, styles.halalBadge, sizeStyles[size], style]}>
        <Ionicons
          name="checkmark-circle"
          size={size === 'sm' ? 12 : 16}
          color={Colors.halalGreen}
        />
        <Text style={[styles.text, styles.halalText, sizeText[size]]}>
          {label}
        </Text>
      </View>
    );
  }

  if (variant === 'risk' && riskLevel) {
    const color = riskColors[riskLevel] ?? Colors.gray600;
    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: `${color}18` },
          sizeStyles[size],
          style,
        ]}
      >
        <View style={[styles.riskDot, { backgroundColor: color }]} />
        <Text style={[styles.text, { color }, sizeText[size]]}>{label}</Text>
      </View>
    );
  }

  // Status / info badge
  const colors = statusColors[status];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        sizeStyles[size],
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }, sizeText[size]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  halalBadge: {
    backgroundColor: Colors.halalBadgeBg,
  },
  text: {
    fontWeight: FontWeight.medium,
  },
  halalText: {
    color: Colors.halalGreen,
    marginLeft: Spacing['1'],
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing['1'],
  },
});

const sizeStyles: Record<'sm' | 'md', ViewStyle> = {
  sm: {
    paddingHorizontal: Spacing['2'],
    paddingVertical: Spacing['0.5'],
  },
  md: {
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['1'],
  },
};

const sizeText = {
  sm: { fontSize: FontSize.xs },
  md: { fontSize: FontSize.sm },
};
