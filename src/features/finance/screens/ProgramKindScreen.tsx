import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Banner, Button, Card, EmptyState, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import type { ProgramKind } from '@/repositories/contracts/program';
import { useTheme } from '@/theme';
import { PROGRAM_KINDS, kindInfo } from '../catalog/program-kinds';
import { FinanceScaffold } from '../components/FinanceScaffold';

export function ProgramKindScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ kind?: string }>();
  const raw = params.kind ?? '';
  const known = (PROGRAM_KINDS as readonly string[]).includes(raw);
  const info = known ? kindInfo(raw as ProgramKind) : null;

  return (
    <FinanceScaffold
      testID="program-kind-screen"
      title={t('assistance:finance.kind.title')}
    >
      {!info ? (
        <EmptyState
          icon="info"
          title={t('assistance:finance.detail.notFound')}
          description={t('assistance:finance.detail.notFoundDescription')}
          action={{
            label: t('assistance:finance.catalog.title'),
            onPress: () => router.replace(href(ROUTES.programs.root)),
          }}
          testID="program-kind-missing"
        />
      ) : (
        <>
          <Card variant="crest" style={{ gap: theme.spacing[2] }} testID="program-kind-card">
            <Text variant="h2">{t(info.labelKey)}</Text>
            <Text variant="body" color="secondary">
              {t(info.descriptionKey)}
            </Text>
            {info.donatable ? (
              <Badge variant="success" size="sm" label={t('assistance:finance.kind.donatable')} />
            ) : null}
            {info.referralOnly ? (
              <Badge variant="info" size="sm" label={t('assistance:finance.kind.referralOnly')} />
            ) : null}
            {info.inKind ? (
              <Badge variant="accent" size="sm" label={t('assistance:finance.kind.inKind')} />
            ) : null}
          </Card>

          <Banner variant="info" message={t('assistance:finance.kind.note')} testID="program-kind-note" />

          {info.referralOnly ? (
            <Button
              fullWidth
              leftIcon="shield"
              label={t('assistance:finance.kind.referralAction')}
              onPress={() => router.push(href(ROUTES.programs.providerRequirements))}
              testID="program-kind-referral"
            />
          ) : null}
          {info.inKind ? (
            <Button
              fullWidth
              leftIcon="shoppingBag"
              label={t('assistance:finance.kind.soukAction')}
              onPress={() => router.push(href(ROUTES.features.souk))}
              testID="program-kind-souk"
            />
          ) : null}
          <Button
            variant="secondary"
            fullWidth
            label={t('assistance:finance.kind.catalogAction')}
            onPress={() => router.replace(href(ROUTES.programs.root))}
            testID="program-kind-catalog"
          />
        </>
      )}
    </FinanceScaffold>
  );
}
