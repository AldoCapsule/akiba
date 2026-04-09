import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, CARD_PADDING, Shadows } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Elevation level */
  elevation?: 'sm' | 'md' | 'lg';
  /** Remove padding */
  noPadding?: boolean;
}

export function Card({
  children,
  style,
  elevation = 'md',
  noPadding = false,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        Shadows[elevation],
        !noPadding && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  padded: {
    padding: CARD_PADDING,
  },
});
