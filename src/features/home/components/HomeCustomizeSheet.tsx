import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Switch, Text } from '@/components/ui';
import { useDirection } from '@/hooks';
import { useShellStore } from '@/stores';
import { useTheme } from '@/theme';
import { HOME_QUICK_ACTION_IDS } from '../config/home-config.types';
import { useHomeConfig } from '../hooks/use-home-config';

export function HomeCustomizeSheet() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const config = useHomeConfig();
  const closeSheet = useShellStore((s) => s.closeSheet);

  return (
    <View style={[styles.root, { gap: theme.spacing[3] }]} testID="home-customize-sheet">
      <Text variant="h2">{t('home:customize.title')}</Text>
      <Text variant="caption" color="secondary">
        {t('home:customize.subtitle')}
      </Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ gap: theme.spacing[2], paddingBottom: theme.spacing[3] }}
      >
        <Text variant="h3">{t('home:customize.sections')}</Text>
        {config.order.map((id, index) => (
          <Card key={id} testID={`customize-section-${id}`} style={{ gap: theme.spacing[2] }}>
            <Switch
              value={!config.hiddenSections.includes(id)}
              onValueChange={(value) => config.setSectionVisible(id, value)}
              label={t(`home:sections.${id}.title`)}
              labelFirst
              testID={`customize-visible-${id}`}
            />
            <View
              style={[
                styles.row,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
              ]}
            >
              <Button
                variant="icon"
                size="sm"
                leftIcon="chevronUp"
                accessibilityLabel={t('home:customize.moveUp')}
                disabled={index === 0}
                onPress={() => config.moveSection(id, -1)}
                testID={`customize-up-${id}`}
              />
              <Button
                variant="icon"
                size="sm"
                leftIcon="chevronDown"
                accessibilityLabel={t('home:customize.moveDown')}
                disabled={index === config.order.length - 1}
                onPress={() => config.moveSection(id, 1)}
                testID={`customize-down-${id}`}
              />
            </View>
          </Card>
        ))}
        <Text variant="h3">{t('home:customize.quickActions')}</Text>
        {HOME_QUICK_ACTION_IDS.map((id) => (
          <Switch
            key={id}
            value={config.quickActions.includes(id)}
            onValueChange={(value) => config.setQuickActionVisible(id, value)}
            label={t(`home:quickActions.${id}`)}
            labelFirst
            testID={`customize-quick-${id}`}
          />
        ))}
      </ScrollView>
      <View
        style={[
          styles.footer,
          { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
        ]}
      >
        <Button
          variant="ghost"
          label={t('home:customize.reset')}
          onPress={config.reset}
          testID="customize-reset"
        />
        <Button
          style={styles.done}
          label={t('home:customize.done')}
          onPress={closeSheet}
          testID="customize-done"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  row: { alignItems: 'center' },
  footer: { alignItems: 'center', justifyContent: 'flex-end' },
  done: { minWidth: 120 },
});
