import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Banner, Button, Card, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import type { ApplicationPayload } from '@/repositories/contracts/application';
import { useTheme } from '@/theme';
import { scoreApplication } from '../engine';
import type { AdvisoryEvaluation } from '@/repositories/contracts/application';
import { NumericField } from '../components/NumericField';
import { useEligibilityRules } from '../hooks/use-assistance-query';

/** Transient placeholder — the pre-check is never persisted nor submitted. */
const PRECHECK_FINGERPRINT = 'precheck-not-stored-0000';

export function PreCheckScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const rules = useEligibilityRules();

  const [income, setIncome] = useState<number | null>(null);
  const [household, setHousehold] = useState<number | null>(null);
  const [assets, setAssets] = useState<number | null>(null);
  const [dependents, setDependents] = useState<number | null>(null);
  const [result, setResult] = useState<AdvisoryEvaluation | null>(null);

  const run = (): void => {
    const payload: ApplicationPayload = {
      applicant: {
        governorateId: 'precheck',
        districtId: null,
        birthYear: 1995,
        householdSize: household ?? 1,
        identityHash: PRECHECK_FINGERPRINT,
        phoneHash: PRECHECK_FINGERPRINT,
      },
      income: {
        employmentStatus: 'employed',
        incomeSource: (income ?? 0) > 0 ? 'salary' : 'none',
        monthlyIncome: income ?? 0,
        stabilityMonths: 12,
      },
      assets: {
        availableAssets: assets ?? 0,
        restrictedAssets: 0,
        unreceivedInheritance: 0,
        savings: 0,
      },
      obligations: {
        monthlyRent: 0,
        monthlyDebtPayments: 0,
        monthlyEssentials: 0,
        dependentsCount: dependents ?? 0,
      },
      engagement: {
        engagementStatus: 'official_engagement',
        engagementProofType: 'engagement_certificate',
      },
      documents: [],
      declarations: {
        truthful: true,
        verificationConsent: true,
        processingConsent: true,
        publicationConsent: false,
      },
    };
    setResult(scoreApplication({ payload, requestedAmount: 1, priorAssistanceCount: 0 }, rules.data));
  };

  return (
    <Screen
      scroll
      testID="precheck-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.assistance.root))}
        testID="precheck-back"
        style={styles.back}
      />
      <Text variant="h1">{t('assistance:preCheck.title')}</Text>
      <Banner variant="warning" message={t('assistance:preCheck.notStored')} testID="precheck-note" />

      <NumericField
        testID="precheck-income"
        label={t('assistance:wizard.fields.monthlyIncome')}
        value={income}
        onChange={setIncome}
      />
      <NumericField
        testID="precheck-household"
        label={t('assistance:wizard.fields.household')}
        value={household}
        onChange={setHousehold}
      />
      <NumericField
        testID="precheck-assets"
        label={t('assistance:wizard.fields.availableAssets')}
        value={assets}
        onChange={setAssets}
      />
      <NumericField
        testID="precheck-dependents"
        label={t('assistance:wizard.fields.dependents')}
        value={dependents}
        onChange={setDependents}
      />
      <Button fullWidth label={t('assistance:preCheck.action')} onPress={run} testID="precheck-run" />

      {result ? (
        <Card variant="crest" testID="precheck-result" style={{ gap: theme.spacing[2] }}>
          <Text variant="h3">{t(result.bandLabelKey)}</Text>
          <Text variant="body" color="secondary" testID="precheck-recommendation">
            {t(result.recommendationKey)}
          </Text>
          <Badge variant="pending" label={t('assistance:policy.advisory')} />
          <View style={styles.gates}>
            {result.gates.map((gate) => (
              <Text key={gate.key} variant="caption" color="secondary">
                {t(gate.reasonKey)}
              </Text>
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', marginTop: 8 },
  gates: { gap: 4 },
});
