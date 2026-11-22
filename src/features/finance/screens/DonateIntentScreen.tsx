import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Banner, Button, Card, Checkbox, EmptyState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { authErrorKey } from '@/features/auth/errors';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { kindInfo, programKindOf } from '../catalog/program-kinds';
import { AmountField } from '../components/AmountField';
import { CertaintyBadge } from '../components/CertaintyBadge';
import { FinanceScaffold } from '../components/FinanceScaffold';
import { useDonationIntent } from '../hooks/use-donation-intent';
import { useProgramDetail } from '../hooks/use-program-catalog';

export function DonateIntentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';
  const detail = useProgramDetail(id);
  const intent = useDonationIntent(id);
  const format = useHomeFormatters();
  const [amount, setAmount] = useState<number | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);

  const program = detail.program;
  const info = kindInfo(program ? programKindOf(program) : 'grant');
  const donatable = program !== null && program.status === 'open' && info.donatable;
  const donation = intent.donation;

  const submit = async (): Promise<void> => {
    if (!program) return;
    if (amount === null || amount <= 0) {
      setValidation('assistance:finance.donate.validation.amount');
      return;
    }
    if (amount < program.minAmount) {
      setValidation('assistance:finance.donate.validation.min');
      return;
    }
    if (amount > program.maxAmount) {
      setValidation('assistance:finance.donate.validation.max');
      return;
    }
    setValidation(null);
    await intent.create(amount, anonymous);
  };

  return (
    <FinanceScaffold
      testID="donate-intent-screen"
      title={t('assistance:finance.donate.title')}
      subtitle={t('assistance:finance.donate.subtitle')}
      guardBackend
      notConnectedRetry={detail.refetch}
    >
      {detail.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {!detail.isLoading && !program ? (
        <EmptyState
          icon="info"
          title={t('assistance:finance.detail.notFound')}
          description={t('assistance:finance.detail.notFoundDescription')}
          action={{
            label: t('assistance:finance.catalog.title'),
            onPress: () => router.replace(href(ROUTES.programs.root)),
          }}
          testID="donate-missing"
        />
      ) : null}

      {program ? (
        <Card style={{ gap: theme.spacing[2] }} testID="donate-program-card">
          <Text variant="h3">{t(program.nameKey)}</Text>
          <Text variant="caption" color="secondary" testID="donate-range">
            {t('assistance:finance.donate.minMax', {
              min: format.number(program.minAmount),
              max: format.number(program.maxAmount),
            })}
          </Text>
        </Card>
      ) : null}

      {program && !donatable ? (
        <Text variant="body" color="secondary" testID="donate-blocked">
          {info.donatable
            ? t('assistance:finance.detail.notOpen')
            : t('assistance:finance.detail.notDonatable')}
        </Text>
      ) : null}

      {donatable && !donation ? (
        <>
          <Banner
            variant="warning"
            message={t('assistance:finance.donate.notice')}
            testID="donate-notice"
          />
          <AmountField
            testID="donate-amount"
            label={t('assistance:finance.donate.amount')}
            required
            value={amount}
            onChange={setAmount}
            errorText={validation ? t(validation) : undefined}
          />
          <Checkbox
            testID="donate-anonymous"
            checked={anonymous}
            onCheckedChange={setAnonymous}
            label={t('assistance:finance.donate.anonymous')}
          />
          <Text variant="caption" color="secondary">
            {t('assistance:finance.donate.anonymousHelp')}
          </Text>
          <Button
            fullWidth
            loading={intent.busy}
            label={t('assistance:finance.donate.action')}
            onPress={() => {
              void submit();
            }}
            testID="donate-create"
          />
        </>
      ) : null}

      {donation ? (
        <Card variant="crest" style={{ gap: theme.spacing[3] }} testID="donate-result">
          <CertaintyBadge status={donation.status} testID="donate-certainty" />
          <Text variant="h2" color="gold" testID="donate-amount-value">
            {format.number(donation.amount)}
          </Text>
          {donation.anonymous ? (
            <Badge variant="neutral" size="sm" label={t('assistance:finance.donations.anonymousLabel')} />
          ) : null}
          <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
          {donation.providerReference ? (
            <Text variant="caption" color="secondary" testID="donate-provider-reference">
              {donation.providerReference}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {donation && donation.status === 'intent_created' ? (
        <Button
          fullWidth
          loading={intent.busy}
          label={t('assistance:finance.donate.handoff')}
          onPress={() => {
            void intent.handoff();
          }}
          testID="donate-handoff"
        />
      ) : null}

      {donation && donation.status === 'provider_pending' ? (
        <>
          <Banner
            variant="demo"
            message={t('assistance:finance.donate.simulateNote')}
            testID="donate-simulate-note"
          />
          <Button
            fullWidth
            variant="secondary"
            loading={intent.busy}
            label={t('assistance:finance.donate.simulate')}
            onPress={() => {
              void intent.simulateConfirm();
            }}
            testID="donate-simulate"
          />
        </>
      ) : null}

      {donation && donation.status === 'provider_confirmed' ? (
        <Banner
          variant="info"
          message={t('assistance:finance.donate.verifiedNote')}
          testID="donate-verified-note"
        />
      ) : null}

      {intent.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(intent.error))}
          testID="donate-error"
        />
      ) : null}

      {donation ? (
        <>
          <Button
            variant="ghost"
            fullWidth
            label={t('assistance:finance.donate.requirementsAction')}
            onPress={() => router.push(href(ROUTES.programs.providerRequirements))}
            testID="donate-requirements"
          />
          <Button
            variant="secondary"
            fullWidth
            label={t('assistance:finance.donate.donationsAction')}
            onPress={() => router.replace(href(ROUTES.programs.donations))}
            testID="donate-open-donations"
          />
        </>
      ) : null}
    </FinanceScaffold>
  );
}
