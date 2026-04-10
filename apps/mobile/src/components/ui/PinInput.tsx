import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET } from '../../constants/spacing';

interface PinInputProps {
  length?: number;
  secure?: boolean;
  onComplete: (code: string) => void;
  onChangeCode?: (code: string) => void;
  error?: boolean;
  autoFocus?: boolean;
}

export function PinInput({
  length = 6,
  secure = false,
  onComplete,
  onChangeCode,
  error = false,
  autoFocus = true,
}: PinInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      ]).start(() => {
        setDigits(Array(length).fill(''));
        inputRefs.current[0]?.focus();
      });
    }
  }, [error]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, []);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, length);
      const newDigits = Array(length).fill('');
      pasted.split('').forEach((d, i) => { newDigits[i] = d; });
      setDigits(newDigits);
      onChangeCode?.(newDigits.join(''));
      if (pasted.length === length) {
        onComplete(pasted);
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
      return;
    }

    const digit = text.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    const code = newDigits.join('');
    onChangeCode?.(code);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (code.length === length && !code.includes('')) {
      onComplete(code);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      onChangeCode?.(newDigits.join(''));
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={[
            styles.box,
            digit ? styles.boxFilled : null,
            error ? styles.boxError : null,
          ]}
          value={secure && digit ? '\u25CF' : digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={index === 0 ? length : 1}
          selectTextOnFocus
          accessibilityLabel={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </Animated.View>
  );
}

const BOX_SIZE = MIN_TOUCH_TARGET;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['2'],
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE + 8,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.lg,
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  boxFilled: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  boxError: {
    borderColor: Colors.error,
    backgroundColor: `${Colors.error}08`,
  },
});
