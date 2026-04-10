import React from 'react';
import { CicdCustomPageComponent } from './CicdCustomPageComponent';
import { http , HttpResponse} from 'msw';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';
import {
  registerMswTestHooks,
  renderInTestApp,
} from "@backstage/test-utils";

describe('CicdCustomPageComponent', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  registerMswTestHooks(server);

  // setup mock response
  beforeEach(() => {
    server.use(
      http.get('/*', () => new HttpResponse(null, {
        status: 200,
      }))
    );
  });

  it('should render', async () => {
    await renderInTestApp(<CicdCustomPageComponent />);
    expect(screen.getByText('Welcome to CicdCustomPageComponent!')).toBeInTheDocument();
  });
});
