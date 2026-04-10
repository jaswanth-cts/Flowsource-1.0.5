import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppComponent from '../components/AppComponent';

describe('AppComponent', () => {
  // Positive test case
  it('should render the component with correct text', () => {
    const { getByText } = render(<AppComponent />);
    expect(getByText('Sample Home Page')).toBeInTheDocument();
  });

  // Negative test case
  it('should not render incorrect text', () => {
    const { queryByText } = render(<AppComponent />);
    expect(queryByText('Incorrect Text')).toBeNull();
  });
});