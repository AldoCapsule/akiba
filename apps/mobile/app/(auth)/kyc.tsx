import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET, Shadows } from '../../src/constants/spacing';
import { useAuth } from '../../src/hooks/useAuth';
import { validateFullName } from '../../src/utils/validation';

type KycStep = 'tier-select' | 'tier1' | 'tier2' | 'submitted';

interface TierInfo {
  tier: 1 | 2 | 3;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const tiers: TierInfo[] = [
  {
    tier: 1,
    title: 'Niveau 1 — Basique',
    description: 'Nom complet et date de naissance.\nLimite: 200 000 FCFA/mois.',
    icon: 'person-outline',
    color: Colors.info,
  },
  {
    tier: 2,
    title: 'Niveau 2 — Standard',
    description: 'Pièce d\'identité (CNI ou passeport).\nLimite: 2 000 000 FCFA/mois.',
    icon: 'card-outline',
    color: Colors.primary,
  },
  {
    tier: 3,
    title: 'Niveau 3 — Premium',
    description: 'Justificatif de revenus.\nAucune limite.',
    icon: 'diamond-outline',
    color: Colors.gold,
  },
];

export default function KycScreen() {
  const router = useRouter();
  const { submitKyc, isSubmittingKyc, t } = useAuth();

  const [step, setStep] = useState<KycStep>('tier-select');
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async (source: 'camera' | 'gallery') => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: 'images',
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    };

    let result;
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra.');
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', 'Autorisez l\'accès à la galerie.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets[0]) {
      setIdPhoto(result.assets[0].uri);
    }
  };

  const handleSelectTier = (tier: 1 | 2 | 3) => {
    setSelectedTier(tier);
    setStep('tier1');
  };

  const handleSubmitTier1 = () => {
    const newErrors: Record<string, string> = {};
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.valid) newErrors.fullName = nameValidation.error!;
    if (!dateOfBirth) newErrors.dateOfBirth = 'Requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (selectedTier >= 2) {
      setStep('tier2');
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      await submitKyc({
        fullName,
        dateOfBirth,
        idNumber: idNumber || undefined,
        idPhotoUri: idPhoto || undefined,
        tier: selectedTier,
      });
      setStep('submitted');
    } catch (err: any) {
      Alert.alert('Erreur', err?.message ?? 'Échec de la soumission.');
    }
  };

  const handleContinue = () => {
    router.replace('/(auth)/risk-assessment');
  };

  // Tier selection screen
  if (step === 'tier-select') {
    return (
      <ScreenWrapper>
        <Header title="" showBack />
        <View style={styles.section}>
          <Text style={styles.title}>{t('kyc.title')}</Text>
          <Text style={styles.subtitle}>{t('kyc.subtitle')}</Text>
        </View>

        <View style={styles.tierList}>
          {tiers.map((tier) => (
            <TouchableOpacity
              key={tier.tier}
              onPress={() => handleSelectTier(tier.tier)}
              activeOpacity={0.8}
            >
              <Card style={styles.tierCard}>
                <View style={styles.tierRow}>
                  <View style={[styles.tierIcon, { backgroundColor: `${tier.color}15` }]}>
                    <Ionicons name={tier.icon} size={24} color={tier.color} />
                  </View>
                  <View style={styles.tierInfo}>
                    <Text style={styles.tierTitle}>{tier.title}</Text>
                    <Text style={styles.tierDesc}>{tier.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.skipRow}>
          <Button
            title="Passer pour l'instant"
            variant="ghost"
            size="md"
            onPress={handleContinue}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // Tier 1 form: Name + DOB
  if (step === 'tier1') {
    return (
      <ScreenWrapper avoidKeyboard>
        <Header title={t('kyc.tier1Title')} showBack onBack={() => setStep('tier-select')} />
        <View style={styles.form}>
          <Input
            label={t('kyc.fullName')}
            value={fullName}
            onChangeText={(v) => { setFullName(v); setErrors({}); }}
            placeholder="Prénom Nom"
            autoCapitalize="words"
            error={errors.fullName}
          />
          <Input
            label={t('kyc.dateOfBirth')}
            value={dateOfBirth}
            onChangeText={(v) => { setDateOfBirth(v); setErrors({}); }}
            placeholder="JJ/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
            error={errors.dateOfBirth}
          />
        </View>
        <View style={styles.formAction}>
          <Button
            title={selectedTier >= 2 ? 'Continuer' : t('kyc.submit')}
            onPress={handleSubmitTier1}
            loading={selectedTier === 1 && isSubmittingKyc}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // Tier 2 form: ID document upload
  if (step === 'tier2') {
    return (
      <ScreenWrapper avoidKeyboard>
        <Header title={t('kyc.tier2Title')} showBack onBack={() => setStep('tier1')} />
        <View style={styles.form}>
          <Input
            label={t('kyc.idNumber')}
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Numéro CNI ou passeport"
          />

          <Text style={styles.uploadLabel}>{t('kyc.uploadId')}</Text>

          {idPhoto ? (
            <TouchableOpacity
              onPress={() => setIdPhoto(null)}
              style={styles.photoPreview}
            >
              <Image source={{ uri: idPhoto }} style={styles.previewImage} />
              <View style={styles.removePhoto}>
                <Ionicons name="close-circle" size={28} color={Colors.error} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.uploadButtons}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => pickImage('camera')}
              >
                <Ionicons name="camera-outline" size={28} color={Colors.primary} />
                <Text style={styles.uploadOptionText}>{t('kyc.takePhoto')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => pickImage('gallery')}
              >
                <Ionicons name="images-outline" size={28} color={Colors.primary} />
                <Text style={styles.uploadOptionText}>{t('kyc.chooseFromGallery')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.formAction}>
          <Button
            title={t('kyc.submit')}
            onPress={handleFinalSubmit}
            loading={isSubmittingKyc}
            disabled={!idPhoto}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // Submitted confirmation
  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.submittedContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={72} color={Colors.primary} />
        </View>
        <Text style={styles.submittedTitle}>Documents soumis</Text>
        <Text style={styles.submittedDesc}>
          Votre vérification est en cours. Vous serez notifié dès qu'elle sera terminée.
        </Text>
        <Badge label={t('kyc.pending')} variant="status" status="warning" size="md" />
      </View>
      <View style={styles.formAction}>
        <Button title="Continuer" onPress={handleContinue} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['6'],
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    marginBottom: Spacing['2'],
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  tierList: {
    paddingHorizontal: Spacing['4'],
    gap: Spacing['3'],
  },
  tierCard: {
    padding: Spacing['4'],
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  tierInfo: {
    flex: 1,
    marginRight: Spacing['2'],
  },
  tierTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  tierDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  skipRow: {
    paddingTop: Spacing['8'],
    alignItems: 'center',
  },
  form: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
    flex: 1,
  },
  formAction: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['6'],
  },
  uploadLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing['3'],
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: Spacing['3'],
  },
  uploadOption: {
    flex: 1,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderStyle: 'dashed',
  },
  uploadOptionText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    marginTop: Spacing['2'],
    textAlign: 'center',
  },
  photoPreview: {
    position: 'relative',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  submittedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['8'],
  },
  successIcon: {
    marginBottom: Spacing['6'],
  },
  submittedTitle: {
    ...Typography.h3,
    color: Colors.navy,
    marginBottom: Spacing['3'],
  },
  submittedDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['4'],
  },
});
