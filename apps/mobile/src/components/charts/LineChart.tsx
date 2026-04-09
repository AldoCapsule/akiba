import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';

interface DataPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  /** Line color */
  color?: string;
  /** Show gradient fill under line */
  showFill?: boolean;
  /** Show horizontal grid lines */
  showGrid?: boolean;
  /** Labels on x-axis */
  xLabels?: string[];
  /** Format y-axis values */
  formatValue?: (value: number) => string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 16;

export function LineChart({
  data,
  width = SCREEN_WIDTH - PADDING * 4,
  height = 200,
  color = Colors.primary,
  showFill = true,
  showGrid = true,
  xLabels,
  formatValue,
}: LineChartProps) {
  if (data.length < 2) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>Pas assez de données</Text>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // Chart drawing area
  const chartPaddingTop = 8;
  const chartPaddingBottom = 24;
  const chartHeight = height - chartPaddingTop - chartPaddingBottom;

  // Scale a value to chart Y coordinate (inverted — 0 at top)
  const scaleY = (value: number): number => {
    const normalized = (value - minValue) / range;
    return chartPaddingTop + chartHeight * (1 - normalized);
  };

  const scaleX = (index: number): number => {
    return (index / (data.length - 1)) * width;
  };

  // Build SVG path
  let linePath = `M ${scaleX(0)} ${scaleY(values[0])}`;
  for (let i = 1; i < values.length; i++) {
    // Smooth curve using quadratic bezier
    const prevX = scaleX(i - 1);
    const prevY = scaleY(values[i - 1]);
    const currX = scaleX(i);
    const currY = scaleY(values[i]);
    const cpX = (prevX + currX) / 2;
    linePath += ` Q ${cpX} ${prevY}, ${currX} ${currY}`;
  }

  // Fill path (close to bottom)
  const fillPath = `${linePath} L ${scaleX(values.length - 1)} ${height} L ${scaleX(0)} ${height} Z`;

  // Grid lines
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount }, (_, i) => {
    const value = minValue + (range / (gridCount - 1)) * i;
    return { y: scaleY(value), value };
  });

  // Overall trend
  const isPositive = values[values.length - 1] >= values[0];
  const lineColor = color;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity={0.2} />
            <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {showGrid &&
          gridLines.map((line, i) => (
            <Line
              key={i}
              x1={0}
              y1={line.y}
              x2={width}
              y2={line.y}
              stroke={Colors.gray200}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}

        {/* Fill area */}
        {showFill && (
          <Path d={fillPath} fill="url(#fillGradient)" />
        )}

        {/* Line */}
        <Path
          d={linePath}
          stroke={lineColor}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      {/* X-axis labels */}
      {xLabels && xLabels.length > 0 && (
        <View style={[styles.xLabels, { width }]}>
          {xLabels.map((label, i) => (
            <Text key={i} style={styles.xLabel}>
              {label}
            </Text>
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
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing['1'],
  },
  xLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});
