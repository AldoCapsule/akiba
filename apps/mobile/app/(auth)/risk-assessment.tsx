import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Card } from '../../src/components/ui/Card';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET } from '../../src/constants/spacing';
import { useAuth } from '../../src/hooks/useAuth';

interface Question {
  id: number;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  answers: { id: number; text: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: 'Quel est votre objectif principal ?',
    icon: 'flag-outline',
    answers: [
      { id: 1, text: 'Préserver mon capital', score: 1 },
      { id: 2, text: 'Revenus réguliers', score: 2 },
      { id: 3, text: 'Croissance modérée', score: 3 },
      { id: 4, text: 'Croissance maximale', score: 4 },
    ],
  },
  {
    id: 2,
    text: 'Sur combien de temps souhaitez-vous investir ?',
    icon: 'time-outline',
    answers: [
      { id: 1, text: 'Moins d\'un an', score: 1 },
      { id: 2, text: '1 à 3 ans', score: 2 },
      { id: 3, text: '3 à 5 ans', score: 3 },
      { id: 4, text: 'Plus de 5 ans', score: 4 },
    ],
  },
  {
    id: 3,
    text: 'Si votre investissement perdait 20%, que feriez-vous ?',
    icon: 'trending-down-outline',
    answers: [
      { id: 1, text: 'Je vends tout immédiatement', score: 1 },
      { id: 2, text: 'Je vends une partie', score: 2 },
      { id: 3, text: 'J\'attends que ça remonte', score: 3 },
      { id: 4, text: 'J\'investis davantage', score: 4 },
    ],
  },
  {
    id: 4,
    text: 'Quelle part de votre épargne souhaitez-vous investir ?',
    icon: 'pie-chart-outline',
    answers: [
      { id: 1, text: 'Moins de 10%', score: 1 },
      { id: 2, text: '10% à 25%', score: 2 },
      { id: 3, text: '25% à 50%', score: 3 },
      { id: 4, text: 'Plus de 50%', score: 4 },
    ],
  },
  {
    id: 5,
    text: 'Quel niveau de fluctuation acceptez-vous ?',
    icon: 'pulse-outline',
    answers: [
      { id: 1, text: 'Aucune fluctuation', score: 1 },
      { id: 2, text: 'Fluctuations légères (±5%)', score: 2 },
      { id: 3, text: 'Fluctuations modérées (±15%)', score: 3 },
      { id: 4, text: 'Fluctuations importantes (±30%+)', score: 4 },
    ],
  },
];

type RiskProfile = 'conservative' | 'moderate' | 'balanced' | 'growth' | 'aggressive';

const profileMeta: Record<RiskProfile, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap; description: string }> = {
  conservative: {
    label: 'Conservateur',
    color: Colors.info,
    icon: 'shield-outline',
    description: 'Vous privilégiez la sécurité. Nous vous recommandons des obligations et sukuk.',
  },
  moderate: {
    label: 'Modéré',
    color: '#2ECC71',
    icon: 'leaf-outline',
    description: 'Un bon équilibre entre sécurité et rendement. Mix obligations/actions.',
  },
  balanced: {
    label: 'Équilibré',
    color: Colors.gold,
    icon: 'git-compare-outline',
    description: 'Répartition équilibrée entre actions, obligations et sukuk.',
  },
  growth: {
    label: 'Croissance',
    color: '#E67E22',
    icon: 'trending-up-outline',
    description: 'Priorité à la croissance. Plus d\'actions et fonds diversifiés.',
  },
  aggressive: {
    label: 'Dynamique',
    color: Colors.error,
    icon: 'rocket-outline',
    description: 'Recherche de rendement maximal. Principalement des actions BRVM.',
  },
};

function computeProfile(totalScore: number): RiskProfile {
  if (totalScore <= 6) return 'conservative';
  if (totalScore <= 10) return 'moderate';
  if (totalScore <= 14) return 'balanced';
  if (totalScore <= 17) return 'growth';
  return 'aggressive';
}

export default function RiskAssessmentScreen() {
  const router = useRouter();
  const { submitRiskAssessment, isSubmittingRisk } = useAuth();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<RiskProfile | null>(null);

  const question = questions[currentQ];
  const progress = (currentQ + (selectedAnswer !== null ? 1 : 0)) / questions.length;

  const handleSelectAnswer = (answerId: number) => {
    setSelectedAnswer(answerId);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = { ...answers, [question.id]: selectedAnswer };
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate result
      const totalScore = Object.entries(newAnswers).reduce((sum, [qId, aId]) => {
        const q = questions.find((q) => q.id === parseInt(qId));
        const a = q?.answers.find((a) => a.id === aId);
        return sum + (a?.score ?? 0);
      }, 0);
      setResult(computeProfile(totalScore));
    }
  };

  const handleFinish = async () => {
    const apiAnswers = Object.entries(answers).map(([qId, aId]) => ({
      questionId: parseInt(qId),
      answerId: aId,
    }));

    try {
      await submitRiskAssessment(apiAnswers);
    } catch {
      // Continue even if API fails — we can retry later
    }
    router.replace('/(tabs)');
  };

  // Result screen
  if (result) {
    const meta = profileMeta[result];
    return (
      <ScreenWrapper scrollable={false}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIconCircle, { backgroundColor: `${meta.color}15` }]}>
            <Ionicons name={meta.icon} size={56} color={meta.color} />
          </View>
          <Text style={styles.resultTitle}>Votre profil</Text>
          <Text style={[styles.resultLabel, { color: meta.color }]}>{meta.label}</Text>
          <Text style={styles.resultDesc}>{meta.description}</Text>
        </View>
        <View style={styles.resultAction}>
          <Button
            title="Commencer à investir"
            onPress={handleFinish}
            loading={isSubmittingRisk}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <Header
        title="Profil investisseur"
        showBack
        onBack={() => {
          if (currentQ > 0) {
            setCurrentQ(currentQ - 1);
            setSelectedAnswer(answers[questions[currentQ - 1].id] ?? null);
          } else {
            router.back();
          }
        }}
      />

      {/* Progress */}
      <View style={styles.progressWrap}>
        <ProgressBar progress={progress} height={4} />
        <Text style={styles.progressLabel}>
          Question {currentQ + 1} sur {questions.length}
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionSection}>
        <View style={[styles.questionIcon, { backgroundColor: `${Colors.primary}12` }]}>
          <Ionicons name={question.icon} size={28} color={Colors.primary} />
        </View>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>

      {/* Answers */}
      <View style={styles.answers}>
        {question.answers.map((answer) => {
          const isSelected = selectedAnswer === answer.id;
          return (
            <TouchableOpacity
              key={answer.id}
              style={[styles.answerCard, isSelected && styles.answerCardSelected]}
              onPress={() => handleSelectAnswer(answer.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[styles.answerText, isSelected && styles.answerTextSelected]}
              >
                {answer.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next button */}
      <View style={styles.nextAction}>
        <Button
          title={currentQ === questions.length - 1 ? 'Voir mon profil' : 'Suivant'}
          onPress={handleNext}
          disabled={selectedAnswer === null}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  progressWrap: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['2'],
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing['2'],
  },
  questionSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing['6'],
    paddingTop: Spacing['8'],
    paddingBottom: Spacing['6'],
  },
  questionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['4'],
  },
  questionText: {
    ...Typography.h4,
    color: Colors.navy,
    textAlign: 'center',
  },
  answers: {
    paddingHorizontal: Spacing['4'],
    gap: Spacing['3'],
    flex: 1,
  },
  answerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing['4'],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    minHeight: MIN_TOUCH_TARGET + 8,
  },
  answerCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.gray400,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  answerText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  answerTextSelected: {
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  nextAction: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['6'],
    paddingTop: Spacing['4'],
  },
  // Result
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['8'],
  },
  resultIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['6'],
  },
  resultTitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing['2'],
  },
  resultLabel: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    marginBottom: Spacing['4'],
  },
  resultDesc: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  resultAction: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['6'],
  },
});
