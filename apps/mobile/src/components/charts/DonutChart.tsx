import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  /** Text displayed in the center */
  centerLabel?: string;
  centerValue?: string;
  /** Show legend below chart */
  showLegend?: boolean;
}

export function DonutChart({
  segments,
  size = 160,
  strokeWidth = 20,
  centerLabel,
  centerValue,
  showLegend = true,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Normalize to percentages
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const normalized = segments.map((s) => ({
    ...s,
    percent: total > 0 ? s.value / total : 0,
  }));

  // Calculate stroke offsets
  let cumulativePercent = 0;
  const arcs = normalized.map((segment) => {
    const strokeDasharray = `${segment.percent * circumference} ${circumference}`;
    const rotation = cumulativePercent * 360 - 90; // Start from top
    cumulativePercent += segment.percent;
    return { ...segment, strokeDasharray, rotation };
  });

  return (
    <View style={styles.container}>
      <View style={[styles.chartWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={Colors.gray200}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Segments */}
          {arcs.map((arc, index) => (
            <G
              key={index}
              rotation={arc.rotation}
              origin={`${center}, ${center}`}
            >
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={arc.strokeDasharray}
                strokeLinecap="round"
                fill="none"
              />
            </G>
          ))}
        </Svg>
        {/* Center text */}
        {(centerLabel || centerValue) && (
          <View style={styles.centerText}>
            {centerValue && (
              <Text style={styles.centerValue}>{centerValue}</Text>
            )}
            {centerLabel && (
              <Text style={styles.centerLabel}>{centerLabel}</Text>
            )}
          </View>
        )}
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          {normalized.map((segment, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: segment.color }]}
              />
              <Text style={styles.legendLabel}>{segment.label}</Text>
              <Text style={styles.legendPercent}>
                {Math.round(segment.percent * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  centerLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  legend: {
    marginTop: Spacing['4'],
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing['1'],
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing['2'],
  },
  legendLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  legendPercent: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});
