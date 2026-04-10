import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/pages/index';
import AddBootstrap from '@/components/AddBootstrap';
import AppComponent from '@/components/AppComponent';

jest.mock('@/components/AddBootstrap');
jest.mock('@/components/AppComponent');

describe('Home Component', () => {
  beforeEach(() => {
    (AppComponent as jest.Mock).mockImplementation(() => <div data-testid="app-component" />);
  });

  test('should render Home with AppComponent', () => {
    render(<Home />);
    const appComponent = screen.getByTestId('app-component');
    expect(appComponent).toBeInTheDocument();
  });
});
describe('Home Component', () => {
  beforeEach(() => {
    (AddBootstrap as jest.Mock).mockImplementation(() => <div data-testid="add-bootstrap" />);
    (AppComponent as jest.Mock).mockImplementation(() => <div data-testid="app-component" />);
  });

  test('should render Home with AddBootstrap and AppComponent', () => {
    render(<Home />);
    const addBootstrap = screen.getByTestId('add-bootstrap');
    const appComponent = screen.getByTestId('app-component');
    expect(addBootstrap).toBeInTheDocument();
    expect(appComponent).toBeInTheDocument();
  });

  test('should not render non-existent elements', () => {
    render(<Home />);
    const nonExistentElement = screen.queryByTestId('non-existent-element');
    expect(nonExistentElement).not.toBeInTheDocument();
  });
});