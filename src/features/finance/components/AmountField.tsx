import { TextInput } from '@/components/ui';

export interface AmountFieldProps {
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
  readonly label: string;
  readonly required?: boolean;
  readonly helpText?: string;
  readonly errorText?: string;
  readonly testID?: string;
}

/** Integer YER only. Empty stays null so validation stays honest. */
export function AmountField({
  value,
  onChange,
  label,
  required = false,
  helpText,
  errorText,
  testID,
}: AmountFieldProps) {
  return (
    <TextInput
      testID={testID}
      label={label}
      required={required}
      helpText={helpText}
      errorText={errorText}
      keyboardType="number-pad"
      leftIcon="wallet"
      value={value === null ? '' : String(value)}
      onChangeText={(text) => {
        const digits = text.replace(/\D/g, '').slice(0, 9);
        onChange(digits.length === 0 ? null : Number.parseInt(digits, 10));
      }}
    />
  );
}
