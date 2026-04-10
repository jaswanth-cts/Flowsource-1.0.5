import React from 'react';
import { FieldExtensionComponentProps } from '@backstage/plugin-scaffolder-react';
import type { FieldValidation } from '@rjsf/utils';
import { FormControl, InputLabel, Input, FormHelperText } from '@material-ui/core';

export const ValidationField = ({
  onChange,
  rawErrors,
  required,
  formData,
  schema,
}: FieldExtensionComponentProps<string>) => {
  const { title, description } = schema;
  return (
    <FormControl
      margin="normal"
      required={required}
      error={rawErrors?.length > 0 && !formData}
    >
      <InputLabel htmlFor="validateField">{title}</InputLabel>
      <Input
        id="validateField"
        aria-describedby="validationField"
        value={formData || ''}
        onChange={e => onChange(e.target?.value)}
      />
      <FormHelperText id="validationField">
        {description}
      </FormHelperText>
    </FormControl>
  );
};

export const validateField = (
  value: string,
  validation: FieldValidation,
  context: any,
) => {
  const options = context?.uiSchema['ui:options'];
  const regexString = options?.regex;
  const errorMessage = options?.errorMessage;

  if (!regexString) {
    validation.addError('Invalid regex configuration.');
    return;
  }

  let regex: any;
  try {
    regex = new RegExp(regexString);
  } catch (e) {
    validation.addError('Invalid regex pattern.');
    return;
  }

  if (!regex.test(value)) {
    validation.addError(errorMessage);
  }
};