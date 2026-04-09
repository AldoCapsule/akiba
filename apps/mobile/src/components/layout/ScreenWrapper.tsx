import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { SCREEN_PADDING } from '../../constants/spacing';

interface ScreenWrapperProps {
  children: React.ReactNode;
  /** Use ScrollView (default true) */
  scrollable?: boolean;
  /** Pull-to-refresh handler */
  onRefresh?: () => void;
  /** Is refreshing */
  refreshing?: boolean;
  /** Avoid keyboard */
  avoidKeyboard?: boolean;
  /** Background color */
  backgroundColor?: string;
  /** Remove horizontal padding */
  noPadding?: boolean;
  /** SafeArea edges to apply */
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenWrapper({
  children,
  scrollable = true,
  onRefresh,
  refreshing = false,
  avoidKeyboard = false,
  backgroundColor = Colors.background,
  noPadding = false,
  edges = ['top'],
  style,
  contentStyle,
}: ScreenWrapperProps) {
  const content = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        !noPadding && styles.padded,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        !noPadding && styles.padded,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const wrapped = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }, style]}
      edges={edges}
    >
      {wrapped}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  padded: {
    paddingHorizontal: SCREEN_PADDING,
  },
});
