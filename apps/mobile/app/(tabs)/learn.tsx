import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { useAuthStore } from '../../src/store/auth.store';

type ContentTab = 'courses' | 'articles';

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  lessonsCount: number;
  completedLessons: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  readTime: number;
  category: string;
}

// Sample data — in production these come from the API
const sampleCourses: Course[] = [
  {
    id: '1',
    title: 'Les bases de l\'investissement',
    description: 'Apprenez les fondamentaux pour bien commencer.',
    level: 'beginner',
    duration: 30,
    lessonsCount: 5,
    completedLessons: 0,
    icon: 'school-outline',
    color: Colors.primary,
  },
  {
    id: '2',
    title: 'Comprendre la BRVM',
    description: 'Découvrez la Bourse Régionale des Valeurs Mobilières.',
    level: 'beginner',
    duration: 25,
    lessonsCount: 4,
    completedLessons: 0,
    icon: 'bar-chart-outline',
    color: Colors.info,
  },
  {
    id: '3',
    title: 'Finance islamique & Sukuk',
    description: 'Les principes de la finance conforme à la charia.',
    level: 'intermediate',
    duration: 40,
    lessonsCount: 6,
    completedLessons: 0,
    icon: 'moon-outline',
    color: Colors.gold,
  },
  {
    id: '4',
    title: 'Construire un portefeuille',
    description: 'Diversification et allocation d\'actifs expliquées.',
    level: 'intermediate',
    duration: 35,
    lessonsCount: 5,
    completedLessons: 0,
    icon: 'pie-chart-outline',
    color: '#9B59B6',
  },
  {
    id: '5',
    title: 'Analyse technique',
    description: 'Lire les graphiques et identifier les tendances.',
    level: 'advanced',
    duration: 45,
    lessonsCount: 7,
    completedLessons: 0,
    icon: 'analytics-outline',
    color: Colors.error,
  },
];

const sampleArticles: Article[] = [
  {
    id: 'a1',
    title: 'Comment commencer à investir avec peu d\'argent',
    summary: 'Découvrez comment investir dès 1 000 FCFA et construire votre patrimoine.',
    readTime: 5,
    category: 'Débutant',
  },
  {
    id: 'a2',
    title: 'Qu\'est-ce que le BRVM Composite ?',
    summary: 'L\'indice phare de la bourse régionale expliqué simplement.',
    readTime: 4,
    category: 'Marchés',
  },
  {
    id: 'a3',
    title: 'Obligations vs Sukuk : quelle différence ?',
    summary: 'Comprendre les instruments de dette conventionnels et islamiques.',
    readTime: 6,
    category: 'Éducation',
  },
];

const levelLabels: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const levelColors: Record<string, 'success' | 'warning' | 'error'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
};

export default function LearnScreen() {
  const { t } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ContentTab>('courses');

  const renderCourseCard = ({ item }: { item: Course }) => {
    const progress = item.lessonsCount > 0
      ? item.completedLessons / item.lessonsCount
      : 0;

    return (
      <Card style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <View style={[styles.courseIcon, { backgroundColor: `${item.color}15` }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <Badge
            label={levelLabels[item.level]}
            variant="status"
            status={levelColors[item.level]}
            size="sm"
          />
        </View>

        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseDesc}>{item.description}</Text>

        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{item.duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="layers-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{item.lessonsCount} leçons</Text>
          </View>
        </View>

        {/* Progress or start */}
        <TouchableOpacity style={styles.courseAction} activeOpacity={0.7}>
          <Text style={styles.courseActionText}>
            {progress > 0 ? t('learn.continueCourse') : t('learn.startCourse')}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </Card>
    );
  };

  const renderArticleCard = ({ item }: { item: Article }) => (
    <TouchableOpacity style={styles.articleCard} activeOpacity={0.7}>
      <View style={styles.articleContent}>
        <Badge
          label={item.category}
          variant="status"
          status="info"
          size="sm"
          style={styles.articleBadge}
        />
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text style={styles.articleSummary} numberOfLines={2}>
          {item.summary}
        </Text>
        <Text style={styles.articleReadTime}>
          {item.readTime} {t('learn.minuteRead')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper noPadding scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('learn.title')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'courses' && styles.tabActive]}
          onPress={() => setActiveTab('courses')}
        >
          <Text style={[styles.tabText, activeTab === 'courses' && styles.tabTextActive]}>
            {t('learn.courses')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'articles' && styles.tabActive]}
          onPress={() => setActiveTab('articles')}
        >
          <Text style={[styles.tabText, activeTab === 'articles' && styles.tabTextActive]}>
            {t('learn.articles')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'courses' ? (
        <FlatList
          data={sampleCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={sampleArticles}
          renderItem={renderArticleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['2'],
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing['4'],
    marginBottom: Spacing['4'],
    gap: Spacing['2'],
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing['3'],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['20'],
    gap: Spacing['3'],
  },
  // Courses
  courseCard: {
    padding: Spacing['4'],
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  courseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing['1'],
  },
  courseDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing['3'],
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: Spacing['4'],
    marginBottom: Spacing['3'],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['1'],
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  courseAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['1'],
    paddingTop: Spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  courseActionText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  // Articles
  articleCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  articleContent: {
    padding: Spacing['4'],
  },
  articleBadge: {
    marginBottom: Spacing['2'],
  },
  articleTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing['2'],
  },
  articleSummary: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing['2'],
  },
  articleReadTime: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});
