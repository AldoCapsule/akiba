import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { useAuthStore } from '../../src/store/auth.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    id: '1',
    icon: 'trending-up',
    iconColor: Colors.primary,
    title: 'Investissez dans\nvotre avenir',
    subtitle:
      'Accédez aux marchés financiers de l\'UEMOA directement depuis votre téléphone.',
  },
  {
    id: '2',
    icon: 'shield-checkmark',
    iconColor: Colors.gold,
    title: 'Investissements\nconformes',
    subtitle:
      'Des produits certifiés halal et des options d\'investissement éthique pour tous.',
  },
  {
    id: '3',
    icon: 'wallet',
    iconColor: Colors.info,
    title: 'Commencez avec\n1 000 FCFA',
    subtitle:
      'Pas besoin d\'être riche pour investir. Commencez petit, grandissez régulièrement.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAuthStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    router.push('/(auth)/register');
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={styles.slideContent}>
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: `${item.iconColor}15` }]}>
          <Ionicons name={item.icon} size={64} color={item.iconColor} />
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[Colors.background, Colors.surface]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Logo area */}
        <View style={styles.logoArea}>
          <Text style={styles.logo}>Akiba</Text>
          <Text style={styles.tagline}>Votre patrimoine, simplifié</Text>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
        />

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Bottom actions — in the bottom 60% zone */}
        <View style={styles.actions}>
          <Button
            title={activeIndex === slides.length - 1 ? 'Commencer' : 'Suivant'}
            onPress={handleNext}
          />
          <Button
            title="J'ai déjà un compte"
            variant="ghost"
            onPress={() => router.push('/(auth)/register')}
            size="md"
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: Spacing['6'],
    paddingBottom: Spacing['4'],
  },
  logo: {
    fontSize: 36,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing['1'],
  },
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['8'],
  },
  slideContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['8'],
  },
  slideTitle: {
    ...Typography.h2,
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: Spacing['4'],
  },
  slideSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['6'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray300,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  actions: {
    paddingHorizontal: Spacing['6'],
    paddingBottom: Spacing['4'],
    gap: Spacing['2'],
  },
});
