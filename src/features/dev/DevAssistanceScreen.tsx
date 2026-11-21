// Demo-only review simulator (D-11). Executes reviewer/finance transitions
// through the same workflow service the real console will use in P17.
// Never runs in backend mode and never produces an automated user decision.
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  ListItem,
  NotConnectedState,
  Screen,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { Application } from '@/repositories/contracts/application';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import {
  INFO_REQUEST_FIELDS,
  reasonsFor,
} from '../assistance/config/reason-catalog';
import { RULES_V1 } from '../assistance/engine';
import { submitAssistance } from '../assistance/services/submission-service';
import { applyTransition } from '../assistance/services/workflow-service';
import {
  WORKFLOW_TRANSITIONS,
  toWorkflowStatus,
  type WorkflowActor,
  type WorkflowStatus,
} from '../assistance/state-machine';
import { seedAssistancePayloads } from '../../../mocks/seed/assistance';

const REASONS_REQUIRED: readonly WorkflowStatus[] = ['approved', 'rejected'];

export function DevAssistanceScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const container = useProviderContainer();
  const client = useQueryClient();

  const [applications, setApplications] = useState<readonly Application[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ to: WorkflowStatus; actor: WorkflowActor } | null>(null);
  const [reasons, setReasons] = useState<readonly string[]>([]);
  const [fields, setFields] = useState<readonly string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    const listed = await container.repositories.applications.list({ limit: 50 });
    if (listed.ok) setApplications(listed.value.items);
  }, [container]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (container.mode !== 'demo') {
    return (
      <Screen testID="dev-assistance-screen" style={styles.center}>
        <NotConnectedState title={t('assistance:dev.notDemo')} description={t('assistance:mine.notConnectedDescription')} />
      </Screen>
    );
  }

  const selected = applications.find((a) => a.id === selectedId) ?? null;
  const current = selected ? toWorkflowStatus(selected.status) : null;
  const options = current
    ? WORKFLOW_TRANSITIONS.filter((tr) => tr.from === current && tr.actor !== 'applicant')
    : [];

  const createDemo = async (): Promise<void> => {
    setBusy(true);
    const payload = seedAssistancePayloads[0];
    if (payload) {
      await submitAssistance(
        {
          applications: container.repositories.applications,
          audit: container.repositories.audit,
        },
        {
          applicantId: 'demo-user-test',
          programId: 'demo-program',
          requestedAmount: 150000,
          notes: null,
          payload,
          rules: RULES_V1,
        },
      );
    }
    await refresh();
    await client.invalidateQueries({ queryKey: ['assistance'] });
    setBusy(false);
    setMessage(t('assistance:dev.created'));
  };

  const runTransition = async (
    to: WorkflowStatus,
    actor: WorkflowActor,
  ): Promise<void> => {
    if (!selected) return;
    setBusy(true);
    const patch: Record<string, unknown> = {};
    if (to === 'approved' || to === 'rejected') {
      patch.decision = {
        outcome: to === 'approved' ? 'approved' : 'rejected',
        reasonKeys: reasons.length > 0 ? reasons : [reasonsFor(to === 'approved' ? 'approved' : 'rejected')[0]?.labelKey ?? ''],
        reviewerId: 'dev-reviewer',
        decidedAt: new Date().toISOString(),
        note: null,
      };
    }
    if (to === 'info_requested') {
      const chosen = INFO_REQUEST_FIELDS.filter((f) => fields.includes(f.key));
      const items = (chosen.length > 0 ? chosen : INFO_REQUEST_FIELDS.slice(0, 1)).map((f) => ({
        fieldKey: f.labelKey,
        reasonKey: f.reasonKey,
      }));
      patch.infoRequest = {
        items,
        requestedAt: new Date().toISOString(),
        reviewerId: 'dev-reviewer',
      };
    }
    if (to === 'appeal_resolved') {
      patch.appeal = selected.appeal
        ? {
            ...selected.appeal,
            status: 'resolved',
            resolution: {
              outcome: 'rejected',
              reasonKeys: [reasonsFor('rejected')[0]?.labelKey ?? ''],
              reviewerId: 'dev-reviewer-2',
              decidedAt: new Date().toISOString(),
            },
          }
        : null;
    }
    const result = await applyTransition(
      {
        applications: container.repositories.applications,
        audit: container.repositories.audit,
      },
      {
        applicationId: selected.id,
        to,
        actor,
        actorId: 'dev-reviewer',
        patch: patch as never,
      },
    );
    await refresh();
    await client.invalidateQueries({ queryKey: ['assistance'] });
    setBusy(false);
    setPending(null);
    setReasons([]);
    setFields([]);
    setMessage(result.ok ? t('assistance:dev.applied') : t('assistance:workflow.errors.invalidTransition'));
  };

  const choose = (to: WorkflowStatus, actor: WorkflowActor): void => {
    if (REASONS_REQUIRED.includes(to) || to === 'info_requested' || to === 'appeal_resolved') {
      setPending({ to, actor });
      return;
    }
    void runTransition(to, actor);
  };

  return (
    <Screen
      scroll
      testID="dev-assistance-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.dev))}
        testID="dev-assistance-back"
        style={styles.back}
      />
      <Text variant="h1">{t('assistance:dev.title')}</Text>
      <Badge variant="demo" label={t('common:demo.badge')} />
      <Text variant="body" color="secondary">
        {t('assistance:dev.subtitle')}
      </Text>
      <Button
        fullWidth
        loading={busy}
        label={t('assistance:dev.create')}
        onPress={() => {
          void createDemo();
        }}
        testID="dev-assistance-create"
      />
      {message ? (
        <Banner variant="info" message={message} testID="dev-assistance-message" />
      ) : null}

      {applications.length === 0 ? (
        <Text variant="body" color="secondary" testID="dev-assistance-empty">
          {t('assistance:dev.empty')}
        </Text>
      ) : (
        applications.map((application) => (
          <ListItem
            key={application.id}
            variant="card"
            title={application.referenceNumber ?? application.id}
            subtitle={t(`assistance:workflow.status.${application.status}`)}
            onPress={() => setSelectedId(application.id)}
            testID={`dev-application-${application.id}`}
          />
        ))
      )}

      {selected && current ? (
        <Card style={{ gap: theme.spacing[3] }} testID="dev-assistance-panel">
          <Text variant="h3">{t('assistance:dev.current')}</Text>
          <Badge variant="accent" label={t(`assistance:workflow.status.${selected.status}`)} testID="dev-current-status" />
          {options.length === 0 ? (
            <Text variant="body" color="secondary" testID="dev-no-transitions">
              {t('assistance:dev.noTransitions')}
            </Text>
          ) : (
            options.map((option) => (
              <Button
                key={`${option.to}-${option.actor}`}
                variant="secondary"
                fullWidth
                label={`${t(`assistance:workflow.status.${option.to}`)} · ${option.actor}`}
                onPress={() => choose(option.to, option.actor)}
                testID={`dev-transition-${option.to}`}
              />
            ))
          )}
        </Card>
      ) : null}

      {pending ? (
        <Card style={{ gap: theme.spacing[2] }} testID="dev-assistance-picker">
          <Text variant="h3">
            {pending.to === 'info_requested'
              ? t('assistance:dev.fieldsRequired')
              : t('assistance:dev.reasonsRequired')}
          </Text>
          {pending.to === 'info_requested'
            ? INFO_REQUEST_FIELDS.map((field) => (
                <Checkbox
                  key={field.key}
                  checked={fields.includes(field.key)}
                  onCheckedChange={(checked) =>
                    setFields((prev) =>
                      checked ? [...prev, field.key] : prev.filter((k) => k !== field.key),
                    )
                  }
                  label={t(field.labelKey)}
                  testID={`dev-field-${field.key}`}
                />
              ))
            : reasonsFor(pending.to === 'approved' ? 'approved' : 'rejected').map((reason) => (
                <Checkbox
                  key={reason.key}
                  checked={reasons.includes(reason.labelKey)}
                  onCheckedChange={(checked) =>
                    setReasons((prev) =>
                      checked
                        ? [...prev, reason.labelKey]
                        : prev.filter((k) => k !== reason.labelKey),
                    )
                  }
                  label={t(reason.labelKey)}
                  testID={`dev-reason-${reason.key}`}
                />
              ))}
          <View
            style={[
              styles.row,
              { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
            ]}
          >
            <Button
              style={styles.action}
              variant="ghost"
              label={t('common:buttons.cancel')}
              onPress={() => setPending(null)}
              testID="dev-picker-cancel"
            />
            <Button
              style={styles.action}
              loading={busy}
              label={t('assistance:dev.apply')}
              onPress={() => {
                void runTransition(pending.to, pending.actor);
              }}
              testID="dev-picker-apply"
            />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
  row: { alignItems: 'center' },
  action: { flex: 1 },
});
