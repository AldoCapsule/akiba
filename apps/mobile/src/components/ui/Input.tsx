import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { BorderRadius, Spacing, MIN_TOUCH_TARGET } from '../../constants/spacing';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: Spacing['1'] } : undefined,
            rightIcon ? { paddingRight: Spacing['1'] } : undefined,
            inputStyle,
          ]}
          placeholderTextColor={Colors.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
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
    marginBottom: Spacing['2'],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: MIN_TOUCH_TARGET + 8,
    paddingHorizontal: Spacing['4'],
  },
  inputWrapperFocused: {
    borderColor: Colors.borderFocused,
    backgroundColor: Colors.surface,
  },
  inputWrapperError: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(231, 76, 60, 0.04)',
  },
  iconLeft: {
    marginRight: Spacing['2'],
  },
  iconRight: {
    marginLeft: Spacing['2'],
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: FontWeight.regular,
    paddingVertical: Spacing['3'],
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginTop: Spacing['1'],
    marginLeft: Spacing['1'],
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing['1'],
    marginLeft: Spacing['1'],
  },
});
