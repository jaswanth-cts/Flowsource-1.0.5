import React from 'react';
import { CicdJenkinsCustomPageComponent } from './CicdJenkinsCustomPageComponent';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';
import {
  registerMswTestHooks,
  renderInTestApp,
} from "@backstage/test-utils";

describe('CicdJenkinsCustomPageComponent', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  registerMswTestHooks(server);

  // setup mock response
  beforeEach(() => {
    server.use(
      rest.get('/*', (_, res, ctx) => res(ctx.status(200), ctx.json({}))),
    );
  });

  it('should render', async () => {
    await renderInTestApp(<CicdJenkinsCustomPageComponent />);
    expect(screen.getByText('Welcome to CicdJenkinsCustomPageComponent!')).toBeInTheDocument();
  });
});
