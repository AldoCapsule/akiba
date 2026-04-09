import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/colors';

/**
 * Auth flow stack layout.
 * No bottom tabs here — dedicated auth screens.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="risk-assessment" />
    </Stack>
  );
}
