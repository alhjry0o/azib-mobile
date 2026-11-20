import { TextInput } from '@/components/ui';

export interface NumericFieldProps {
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
  readonly label: string;
  readonly required?: boolean;
  readonly helpText?: string;
  readonly errorText?: string;
  readonly testID?: string;
}

/** Integer-only money/number input. Empty stays null so drafts stay honest. */
export function NumericField({
  value,
  onChange,
  label,
  required = false,
  helpText,
  errorText,
  testID,
}: NumericFieldProps) {
  return (
    <TextInput
      testID={testID}
      label={label}
      required={required}
      helpText={helpText}
      errorText={errorText}
      keyboardType="number-pad"
      value={value === null ? '' : String(value)}
      onChangeText={(text) => {
        const digits = text.replace(/\D/g, '').slice(0, 9);
        onChange(digits.length === 0 ? null : Number.parseInt(digits, 10));
      }}
    />
  );
}
