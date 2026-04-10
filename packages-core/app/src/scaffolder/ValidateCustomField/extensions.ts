import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';
import { ValidationField, validateField } from './ValidationFieldExtension';

export const ValidationFieldExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'ValidationField',
    component: ValidationField,
    validation: validateField,
  }),
);