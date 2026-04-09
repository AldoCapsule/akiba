import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET } from '../../src/constants/spacing';
import { useAuth } from '../../src/hooks/useAuth';
import { Locale } from '../../src/i18n';

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  rightText?: string;
  showBadge?: boolean;
  badgeStatus?: 'success' | 'warning' | 'error';
  badgeLabel?: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

const languageNames: Record<Locale, string> = {
  fr: 'Français',
  wo: 'Wolof',
  en: 'English',
};

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    t,
    locale,
    setLocale,
    logout,
    isLoggingOut,
  } = useAuth();

  const handleLanguageSwitch = () => {
    const locales: Locale[] = ['fr', 'wo', 'en'];
    const currentIndex = locales.indexOf(locale);
    const nextLocale = locales[(currentIndex + 1) % locales.length];
    setLocale(nextLocale);
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const kycStatusMap: Record<string, { label: string; status: 'success' | 'warning' | 'error' | 'neutral' }> = {
    verified: { label: t('kyc.verified'), status: 'success' },
    pending: { label: t('kyc.pending'), status: 'warning' },
    none: { label: 'Non vérifié', status: 'neutral' },
    rejected: { label: 'Rejeté', status: 'error' },
  };

  const kycInfo = kycStatusMap[user?.kycStatus ?? 'none'];

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Compte',
      items: [
        {
          id: 'personal',
          icon: 'person-outline',
          label: t('profile.personalInfo'),
          onPress: () => {},
        },
        {
          id: 'kyc',
          icon: 'shield-checkmark-outline',
          label: t('profile.kycStatus'),
          showBadge: true,
          badgeLabel: kycInfo.label,
          badgeStatus: kycInfo.status,
          onPress: () => router.push('/(auth)/kyc'),
        },
      ],
    },
    {
      title: t('profile.security'),
      items: [
        {
          id: 'biometrics',
          icon: 'finger-print-outline',
          label: t('profile.biometrics'),
          isToggle: true,
          toggleValue: false,
          onToggle: () => {},
        },
        {
          id: 'pin',
          icon: 'keypad-outline',
          label: t('profile.changePin'),
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Préférences',
      items: [
        {
          id: 'language',
          icon: 'language-outline',
          label: t('profile.language'),
          rightText: languageNames[locale],
          onPress: handleLanguageSwitch,
        },
        {
          id: 'notifications',
          icon: 'notifications-outline',
          label: t('profile.notifications'),
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Aide',
      items: [
        {
          id: 'help',
          icon: 'help-circle-outline',
          label: t('profile.helpSupport'),
          onPress: () => {},
        },
        {
          id: 'about',
          icon: 'information-circle-outline',
          label: t('profile.about'),
          rightText: 'v0.1.0',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <ScreenWrapper>
      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={Colors.textInverse} />
        </View>
        <Text style={styles.userName}>
          {user?.fullName ?? 'Utilisateur Akiba'}
        </Text>
        <Text style={styles.userPhone}>
          {user?.phone ?? '+221 XX XXX XX XX'}
        </Text>
        {user?.riskProfile && (
          <Badge
            label={user.riskProfile}
            variant="risk"
            riskLevel={user.riskProfile}
            size="md"
            style={styles.riskBadge}
          />
        )}
      </View>

      {/* Menu sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Card style={styles.menuCard} noPadding>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < section.items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.isToggle ? undefined : item.onPress}
                activeOpacity={item.isToggle ? 1 : 0.7}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={item.icon} size={20} color={Colors.textSecondary} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuRight}>
                  {item.showBadge && item.badgeLabel && (
                    <Badge
                      label={item.badgeLabel}
                      variant="status"
                      status={item.badgeStatus}
                      size="sm"
                    />
                  )}
                  {item.rightText && (
                    <Text style={styles.menuRightText}>{item.rightText}</Text>
                  )}
                  {item.isToggle ? (
                    <Switch
                      value={item.toggleValue}
                      onValueChange={item.onToggle}
                      trackColor={{ false: Colors.gray300, true: `${Colors.primary}60` }}
                      thumbColor={item.toggleValue ? Colors.primary : Colors.gray400}
                    />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={Colors.gray400}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: Spacing['6'],
    paddingBottom: Spacing['6'],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  userName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  riskBadge: {
    marginTop: Spacing['2'],
  },
  section: {
    marginBottom: Spacing['4'],
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing['2'],
    paddingLeft: Spacing['1'],
  },
  menuCard: {
    borderRadius: BorderRadius.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    minHeight: MIN_TOUCH_TARGET,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3'],
    flex: 1,
  },
  menuLabel: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  menuRightText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
    paddingVertical: Spacing['4'],
    marginTop: Spacing['4'],
    marginBottom: Spacing['8'],
  },
  logoutText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.error,
  },
});
