import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { BorderRadius, Spacing, MIN_TOUCH_TARGET } from '../../constants/spacing';
import { formatCFA } from '../../utils/format';

/** Quick-select CFA amounts */
const PRESET_AMOUNTS = [1_000, 5_000, 10_000, 25_000, 50_000] as const;

interface AmountPickerProps {
  value: number;
  onChange: (amount: number) => void;
  /** Minimum amount in CFA */
  min?: number;
  /** Maximum amount in CFA */
  max?: number;
  /** Label shown above */
  label?: string;
  error?: string;
}

export function AmountPicker({
  value,
  onChange,
  min = 1_000,
  max,
  label,
  error,
}: AmountPickerProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customText, setCustomText] = useState('');

  const handlePreset = (amount: number) => {
    setIsCustom(false);
    setCustomText('');
    onChange(amount);
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    onChange(0);
  };

  const handleCustomChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setCustomText(digits);
    const parsed = parseInt(digits, 10);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(0);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Current amount display */}
      <View style={styles.display}>
        <Text style={styles.displayAmount}>
          {value > 0 ? formatCFA(value, { showCurrency: false }) : '0'}
        </Text>
        <Text style={styles.displayCurrency}> FCFA</Text>
      </View>

      {/* Preset buttons */}
      <View style={styles.presetRow}>
        {PRESET_AMOUNTS.map((amount) => {
          const isSelected = !isCustom && value === amount;
          const isOverMax = max !== undefined && amount > max;
          return (
            <TouchableOpacity
              key={amount}
              style={[
                styles.presetButton,
                isSelected && styles.presetButtonSelected,
                isOverMax && styles.presetButtonDisabled,
              ]}
              onPress={() => handlePreset(amount)}
              disabled={isOverMax}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.presetText,
                  isSelected && styles.presetTextSelected,
                  isOverMax && styles.presetTextDisabled,
                ]}
              >
                {formatCFA(amount, { showCurrency: false, compact: true })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom input */}
      <TouchableOpacity
        style={[
          styles.customButton,
          isCustom && styles.customButtonActive,
        ]}
        onPress={handleCustomFocus}
        activeOpacity={0.8}
      >
        {isCustom ? (
          <TextInput
            style={styles.customInput}
            value={customText}
            onChangeText={handleCustomChange}
            keyboardType="number-pad"
            placeholder="Montant personnalisé"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
          />
        ) : (
          <Text
            style={[
              styles.customText,
              isCustom && styles.customTextActive,
            ]}
          >
            Montant personnalisé
          </Text>
        )}
      </TouchableOpacity>

      {/* Min/max hint */}
      {!error && (
        <Text style={styles.hint}>
          Min: {formatCFA(min)}
          {max ? ` — Max: ${formatCFA(max)}` : ''}
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['4'],
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing['3'],
  },
  display: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: Spacing['6'],
  },
  displayAmount: {
    fontSize: 40,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  displayCurrency: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['2'],
    marginBottom: Spacing['3'],
  },
  presetButton: {
    flex: 1,
    minWidth: '18%',
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetButtonSelected: {
    backgroundColor: 'rgba(0, 168, 107, 0.1)',
    borderColor: Colors.primary,
  },
  presetButtonDisabled: {
    opacity: 0.4,
  },
  presetText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  presetTextSelected: {
    color: Colors.primary,
  },
  presetTextDisabled: {
    color: Colors.textTertiary,
  },
  customButton: {
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: Spacing['4'],
    marginBottom: Spacing['2'],
  },
  customButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  customText: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
  },
  customTextActive: {
    color: Colors.primary,
  },
  customInput: {
    width: '100%',
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: FontWeight.semibold,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
  },
});
