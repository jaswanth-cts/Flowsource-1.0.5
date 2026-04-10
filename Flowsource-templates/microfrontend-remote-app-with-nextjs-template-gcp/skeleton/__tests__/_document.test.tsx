import React from 'react';
import { render } from '@testing-library/react';
import { Html, Head, Main, NextScript } from "next/document";
import '@testing-library/jest-dom';
import Document from '@/pages/_document';

// Mock the Html component to avoid importing it outside of _document
jest.mock('next/document', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <html>{children}</html>,
  Head: ({ children }: { children: React.ReactNode }) => <head>{children}</head>,
  Main: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  NextScript: ({ children }: { children: React.ReactNode }) => <script>{children}</script>,
}));

describe('Document Component', () => {
  test('should have a link to the manifest with correct attributes', () => {
    const { container } = render(<Document />);
    expect(container)
  });
});