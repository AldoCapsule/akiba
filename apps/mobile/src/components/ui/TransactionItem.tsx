import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { Spacing, MIN_TOUCH_TARGET } from '../../constants/spacing';
import { formatCFA } from '../../utils/format';
import type { TransactionType } from '../../api/payments';

interface TransactionItemProps {
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
}

const TYPE_CONFIG: Record<TransactionType, { icon: keyof typeof Ionicons.glyphMap; color: string; sign: '+' | '-' }> = {
  deposit: { icon: 'arrow-down-circle', color: Colors.success, sign: '+' },
  withdrawal: { icon: 'arrow-up-circle', color: Colors.error, sign: '-' },
  investment: { icon: 'trending-up', color: Colors.primary, sign: '-' },
  redemption: { icon: 'arrow-undo-circle', color: Colors.info, sign: '+' },
  dividend: { icon: 'gift', color: Colors.gold, sign: '+' },
};

export function TransactionItem({ type, description, amount, date }: TransactionItemProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.deposit;
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: `${config.color}15` }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <Text style={[styles.amount, { color: config.sign === '+' ? Colors.success : Colors.textPrimary }]}>
        {config.sign}{formatCFA(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing['3'],
    minHeight: MIN_TOUCH_TARGET,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  info: {
    flex: 1,
    marginRight: Spacing['2'],
  },
  description: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  amount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
