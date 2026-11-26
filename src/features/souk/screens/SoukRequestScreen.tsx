import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Skeleton, Text, Textarea } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { SoukScaffold } from '../components/SoukScaffold';
import { useSoukItem } from '../hooks/use-souk-item';
import { soukErrorKey } from '../state/error-keys';
import { SoukRequestSchema } from '../schemas/request';

export function SoukRequestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const itemId = params.id ?? '';
  const detail = useSoukItem(itemId);
  const [reason, setReason] = useState('');
  const [validation, setValidation] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    const parsed = SoukRequestSchema.safeParse({ reason });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setValidation(first ? first.message : 'marketplace:souk.validation.reason');
      return;
    }
    setValidation(null);
    const result = await detail.request(parsed.data.reason);
    if (result.ok) router.replace(href(ROUTES.souk.requests));
  };

  return (
    <SoukScaffold
      testID="souk-request-screen"
      title={t('marketplace:souk.request.title')}
      subtitle={t('marketplace:souk.request.subtitle')}
      backTo={ROUTES.souk.detail(itemId)}
      notConnectedRetry={detail.refetch}
    >
      {detail.isLoading ? <Skeleton variant="rect" height={100} /> : null}
      <Banner
        variant="info"
        message={t('marketplace:souk.request.limitNote')}
        testID="souk-request-limit-note"
      />
      <Textarea
        testID="souk-request-reason"
        label={t('marketplace:souk.request.reason')}
        required
        value={reason}
        onChangeText={setReason}
        minHeight={110}
        errorText={validation ? t(validation) : undefined}
      />
      {detail.actionError ? (
        <Banner
          variant="error"
          message={t(soukErrorKey(detail.actionError))}
          testID="souk-request-error"
        />
      ) : null}
      <Button
        fullWidth
        loading={detail.busy}
        label={t('marketplace:souk.request.submit')}
        onPress={() => {
          void submit();
        }}
        testID="souk-request-submit"
      />
      <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing[4] }}>
        {t('marketplace:souk.request.noPaymentNote')}
      </Text>
    </SoukScaffold>
  );
}
