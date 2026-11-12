// Internal component used by DatePicker. Not exported from form/index.ts.
// Renders a Modal with a 7-column calendar grid.

import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useDirection, useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Button } from '../Button';
import { Icon } from '../Icon';
import { Text } from '../Text';
import {
  addMonths,
  buildCalendarGrid,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from './date-utils';

export interface CalendarModalProps {
  readonly visible: boolean;
  readonly value: Date | null;
  readonly minDate?: Date;
  readonly maxDate?: Date;
  readonly onClose: () => void;
  readonly onSelect: (date: Date | null) => void;
}

export function CalendarModal({
  visible,
  value,
  minDate,
  maxDate,
  onClose,
  onSelect,
}: CalendarModalProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const { i18n } = useTranslation();
  const haptics = useHaptics();

  const today = useMemo(() => startOfDay(new Date()), []);
  const initial = value ?? today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const cells = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return new Intl.DateTimeFormat(i18n.language, {
      month: 'long',
      year: 'numeric',
    }).format(d);
  }, [i18n.language, viewMonth, viewYear]);

  const weekdayLabels = useMemo(() => {
    // Jan 7 2024 is a Sunday.
    return [0, 1, 2, 3, 4, 5, 6].map((i) =>
      new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(
        new Date(2024, 0, 7 + i),
      ),
    );
  }, [i18n.language]);

  const goPrev = () => {
    haptics.light();
    const d = addMonths(new Date(viewYear, viewMonth, 1), -1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goNext = () => {
    haptics.light();
    const d = addMonths(new Date(viewYear, viewMonth, 1), 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goToday = () => {
    haptics.light();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const isOutOfRange = (date: Date): boolean => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
  };

  const flexDir: 'row' | 'row-reverse' = isRTL ? 'row-reverse' : 'row';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.colors.bg.overlay }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="close"
      >
        <View
          onStartShouldSetResponder={() => true}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.bg.raised,
              borderRadius: theme.radius.xl,
              padding: theme.spacing[4],
              marginHorizontal: theme.spacing[4],
            },
          ]}
        >
          <View style={[styles.header, { flexDirection: flexDir }]}>
            <Pressable onPress={goPrev} hitSlop={10} accessibilityRole="button" accessibilityLabel="previous month">
              <Icon name={isRTL ? 'chevronRight' : 'chevronLeft'} size={22} color={theme.colors.text.primary} />
            </Pressable>
            <Pressable onPress={goToday} accessibilityRole="button">
              <Text variant="h3">{monthLabel}</Text>
            </Pressable>
            <Pressable onPress={goNext} hitSlop={10} accessibilityRole="button" accessibilityLabel="next month">
              <Icon name={isRTL ? 'chevronLeft' : 'chevronRight'} size={22} color={theme.colors.text.primary} />
            </Pressable>
          </View>

          <View style={[styles.weekdayRow, { flexDirection: flexDir, marginTop: theme.spacing[3] }]}>
            {weekdayLabels.map((label, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text variant="caption" color="secondary" align="center">
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.grid, { flexDirection: flexDir, marginTop: theme.spacing[1] }]}>
            {cells.map((cell, i) => {
              if (!cell.iso || !cell.day) {
                return <View key={i} style={styles.dayCell} />;
              }
              const date = new Date(viewYear, viewMonth, cell.day);
              const selected = isSameDay(date, value);
              const isToday = isSameDay(date, today);
              const disabled = isOutOfRange(date);
              const bg = selected
                ? theme.colors.accent.fill
                : isToday
                  ? theme.colors.bg.surface
                  : 'transparent';
              const textColor = selected
                ? 'primary'
                : disabled
                  ? 'tertiary'
                  : 'primary';
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled }}
                  accessibilityLabel={cell.iso}
                  onPress={() => {
                    if (disabled) return;
                    haptics.light();
                    onSelect(date);
                  }}
                  disabled={disabled}
                  style={styles.dayCell}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor: bg,
                        borderRadius: theme.radius.full,
                        borderWidth: isToday && !selected ? 1 : 0,
                        borderColor: theme.colors.accent.fill,
                      },
                    ]}
                  >
                    <Text variant="body" color={textColor}>
                      {String(cell.day)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.actions, { marginTop: theme.spacing[4], flexDirection: flexDir }]}>
            <Button
              variant="ghost"
              size="sm"
              label="Clear"
              onPress={() => {
                haptics.light();
                onSelect(null);
              }}
            />
            <Button
              variant="primary"
              size="sm"
              label="Today"
              onPress={() => {
                haptics.light();
                onSelect(today);
              }}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center' },
  sheet: { alignSelf: 'center', width: '100%', maxWidth: 420 },
  header: { alignItems: 'center', justifyContent: 'space-between' },
  weekdayRow: { alignItems: 'center' },
  weekdayCell: { flex: 1, alignItems: 'center' },
  grid: { flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  actions: { justifyContent: 'space-between', gap: 8 },
});
