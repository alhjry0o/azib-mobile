import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { Providers } from '../../__tests__/test-utils';
import { Field } from '../Field';

describe('Field', () => {
  it('renders label and children', async () => {
    const { getByText } = await render(
      <Field label="Name">
        <Text>input</Text>
      </Field>,
      { wrapper: Providers },
    );
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('input')).toBeTruthy();
  });

  it('shows required asterisk', async () => {
    const { getByText } = await render(
      <Field label="Name" required>
        <Text>x</Text>
      </Field>,
      { wrapper: Providers },
    );
    expect(getByText('*')).toBeTruthy();
  });

  it('shows help text when no error', async () => {
    const { getByText } = await render(
      <Field label="Name" helpText="Enter your name">
        <Text>x</Text>
      </Field>,
      { wrapper: Providers },
    );
    expect(getByText('Enter your name')).toBeTruthy();
  });

  it('shows error text instead of help text', async () => {
    const { getByText, queryByText } = await render(
      <Field label="Name" helpText="Enter your name" errorText="Required">
        <Text>x</Text>
      </Field>,
      { wrapper: Providers },
    );
    expect(getByText('Required')).toBeTruthy();
    expect(queryByText('Enter your name')).toBeNull();
  });
});
