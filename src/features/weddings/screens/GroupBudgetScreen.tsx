import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  ListItem,
  SegmentedControl,
  Skeleton,
  Text,
  TextInput,
} from '@/components/ui';
import { BUDGET_CATEGORIES, type BudgetCategory, type SplitMode } from '@/repositories/contracts/wedding-budget';
import { ROUTES, href } from '@/constants/routes';
import { authErrorKey } from '@/features/auth/errors';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { CostSplitBars } from '../components/CostSplitBars';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { useWeddingBudget } from '../hooks/use-wedding-budget';
import { useWeddingGroup } from '../hooks/use-wedding-group';
import { useWeddingServices } from '../hooks/use-wedding-services';
import { can } from '../state/roles';

const MAX_SUGGESTIONS = 3;

export function GroupBudgetScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = params.id ?? '';
  const group = useWeddingGroup(groupId);
  const budget = useWeddingBudget(groupId);
  const services = useWeddingServices(groupId);
  const format = useHomeFormatters();
  const [category, setCategory] = useState<BudgetCategory>('hall');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [individual, setIndividual] = useState(false);

  const data = budget.data;
  const role = group.data?.myRole ?? null;
  const canEdit = role !== null && can(role, 'edit_budget');
  const canAdopt = role !== null && can(role, 'adopt_budget');
  const labels: Record<string, string> = {};
  for (const member of group.data?.members ?? []) {
    labels[member.userId] = member.label ?? t('weddings:members.anonymous');
  }
  const suggestions = services.offers.slice(0, MAX_SUGGESTIONS);

  const addItem = async (): Promise<void> => {
    if (label.trim().length === 0 || amount === null) return;
    const result = await budget.addItem({
      category,
      labelKey: label.trim(),
      amount,
      scope: individual ? 'individual' : 'shared',
      memberId: individual ? (group.data?.members.find((m) => m.isSelf)?.userId ?? null) : null,
      offerId: null,
    });
    if (result.ok) {
      setLabel('');
      setAmount(null);
    }
  };

  return (
    <WeddingScaffold
      testID="group-budget-screen"
      title={t('weddings:budget.title')}
      subtitle={t('weddings:budget.subtitle')}
      notConnectedRetry={budget.refetch}
    >
      {budget.isLoading ? <Skeleton variant="rect" height={140} /> : null}
      {budget.error ? (
        <ErrorState
          title={t('weddings:discovery.errorTitle')}
          description={t('weddings:discovery.errorDescription')}
          onRetry={budget.refetch}
          testID="budget-error"
        />
      ) : null}
      {budget.actionError ? (
        <Banner
          variant="error"
          message={t(authErrorKey(budget.actionError))}
          testID="budget-action-error"
        />
      ) : null}

      {data && !data.version ? (
        <EmptyState
          icon="creditCard"
          title={t('weddings:budget.empty')}
          description={t('weddings:budget.emptyDescription')}
          testID="budget-empty"
        />
      ) : null}

      {data && !data.version && canEdit ? (
        <Button
          fullWidth
          loading={budget.busy}
          label={t('weddings:budget.createVersion')}
          onPress={() => {
            void budget.createVersion({ splitMode: 'equal' });
          }}
          testID="budget-create-version"
        />
      ) : null}

      {data?.version ? (
        <Card style={{ gap: theme.spacing[2] }} testID="budget-version-card">
          <Text variant="h3">
            {t('weddings:budget.version', { version: format.number(data.version.version) })}
          </Text>
          <Badge
            variant={data.version.status === 'adopted' ? 'success' : 'pending'}
            size="sm"
            label={t(`weddings:budget.status.${data.version.status}`)}
            testID="budget-version-status"
          />
          <Text variant="caption" color="secondary">
            {t('weddings:budget.approvals', {
              approved: format.number(data.approvedIds.length),
              total: format.number(data.memberIds.length),
            })}
          </Text>
          {data.unanimous ? (
            <Badge variant="verified" size="sm" label={t('weddings:budget.unanimous')} />
          ) : (
            <Text variant="caption" color="secondary" testID="budget-missing">
              {t('weddings:budget.missing', { count: format.number(data.missingIds.length) })}
            </Text>
          )}
        </Card>
      ) : null}

      {data?.version && canEdit ? (
        <SegmentedControl<SplitMode>
          segments={[
            { value: 'equal', label: t('weddings:budget.modes.equal') },
            { value: 'weighted', label: t('weddings:budget.modes.weighted') },
            { value: 'custom', label: t('weddings:budget.modes.custom') },
          ]}
          value={data.version.splitMode}
          onChange={(value) => {
            void budget.setSplit({ splitMode: value });
          }}
          size="sm"
          testID="budget-split-mode"
        />
      ) : null}

      {data?.reportErrorCode ? (
        <Banner
          variant="warning"
          message={t(`weddings:budget.errors.${data.reportErrorCode}`)}
          testID="budget-report-error"
        />
      ) : null}

      {data?.report ? (
        <Card style={{ gap: theme.spacing[3] }} testID="budget-report">
          <Text variant="h3">{t('weddings:budget.reportTitle')}</Text>
          <CostSplitBars shares={data.report.shares} labels={labels} testID="cost-split-bars" />
          <Text variant="bodyStrong">
            {t('weddings:budget.grandTotal', { value: format.number(data.report.grandTotal) })}
          </Text>
        </Card>
      ) : null}

      {suggestions.length > 0 ? (
        <Card style={{ gap: theme.spacing[2] }} testID="budget-offer-suggestions">
          <Text variant="h3">{t('weddings:budget.suggestionsTitle')}</Text>
          <Text variant="caption" color="secondary">
            {t('weddings:budget.suggestionsNote')}
          </Text>
          {suggestions.map((offer) => (
            <View key={offer.id} style={{ gap: theme.spacing[1] }}>
              <Text variant="bodyStrong">{offer.title ?? t(offer.titleKey)}</Text>
              <View style={[styles.suggestionRow, { gap: theme.spacing[2] }]}>
                <Text variant="caption" color="secondary">
                  {format.percent(offer.discountPercent / 100)}
                </Text>
                {offer.discountPlaceholder === true || offer.dataOrigin === 'demo' ? (
                  <Badge
                    variant="pending"
                    size="sm"
                    label={t('marketplace:discount.placeholder')}
                  />
                ) : null}
              </View>
              <Button
                variant="ghost"
                size="sm"
                label={t('weddings:budget.openSuggestion')}
                onPress={() => router.push(href(ROUTES.partners.offer(offer.id)))}
                testID={`budget-suggestion-${offer.id}`}
              />
            </View>
          ))}
        </Card>
      ) : null}

      {data?.version && canEdit ? (
        <Card style={{ gap: theme.spacing[3] }} testID="budget-item-form">
          <Text variant="h3">{t('weddings:budget.addItem')}</Text>
          <SegmentedControl<BudgetCategory>
            segments={BUDGET_CATEGORIES.map((c) => ({
              value: c,
              label: t(`weddings:budget.categories.${c}`),
            }))}
            value={category}
            onChange={setCategory}
            size="sm"
            testID="budget-category"
          />
          <TextInput
            testID="budget-item-label"
            label={t('weddings:budget.itemLabel')}
            value={label}
            onChangeText={setLabel}
          />
          <TextInput
            testID="budget-item-amount"
            label={t('weddings:budget.itemAmount')}
            keyboardType="number-pad"
            value={amount === null ? '' : String(amount)}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, '').slice(0, 9);
              setAmount(digits.length === 0 ? null : Number.parseInt(digits, 10));
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            label={individual ? t('weddings:budget.scopeShared') : t('weddings:budget.scopeIndividual')}
            onPress={() => setIndividual((prev) => !prev)}
            testID="budget-scope-toggle"
          />
          <Button
            fullWidth
            loading={budget.busy}
            label={t('weddings:budget.addItem')}
            onPress={() => {
              void addItem();
            }}
            testID="budget-add-item"
          />
        </Card>
      ) : null}

      {data?.items.map((item) => (
        <ListItem
          key={item.id}
          variant="card"
          title={item.labelKey}
          subtitle={`${t(`weddings:budget.categories.${item.category}`)} · ${format.number(item.amount)}`}
          trailing={
            canEdit ? (
              <Button
                variant="icon"
                size="sm"
                leftIcon="x"
                accessibilityLabel={t('weddings:budget.removeItem')}
                onPress={() => {
                  void budget.removeItem(item.id);
                }}
                testID={`budget-remove-${item.id}`}
              />
            ) : undefined
          }
          testID={`budget-item-${item.id}`}
        />
      ))}

      {data?.version && group.data?.isMember ? (
        <Button
          fullWidth
          variant="secondary"
          loading={budget.busy}
          label={t('weddings:budget.approve')}
          onPress={() => {
            void budget.approve();
          }}
          testID="budget-approve"
        />
      ) : null}

      {data?.version && canAdopt ? (
        <Button
          fullWidth
          variant="gold"
          disabled={!data.unanimous}
          loading={budget.busy}
          label={t('weddings:budget.adopt')}
          onPress={() => {
            void budget.adopt();
          }}
          testID="budget-adopt"
        />
      ) : null}

      {data?.version && canEdit ? (
        <View style={{ gap: theme.spacing[2] }}>
          <Text variant="caption" color="secondary">
            {t('weddings:budget.reissueNote')}
          </Text>
          <Button
            variant="ghost"
            fullWidth
            loading={budget.busy}
            label={t('weddings:budget.reissue')}
            onPress={() => {
              void budget.reissue();
            }}
            testID="budget-reissue"
          />
        </View>
      ) : null}
    </WeddingScaffold>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 8 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center' },
});

void styles.spacer;
