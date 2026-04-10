import React from 'react';
import TestingPage from '../TestingPage/TestingPage';

export interface TestingPluginComponentProps {
  flowsourceComponentType?: string;
}

export const TestingComponent = (flowsourceComponentType: TestingPluginComponentProps) => (
  <TestingPage componentType={flowsourceComponentType} />
);
