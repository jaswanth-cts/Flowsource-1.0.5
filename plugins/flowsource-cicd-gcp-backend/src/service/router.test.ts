import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import { ConfigReader } from '@backstage/config';

import { createRouter } from './router';

const config = ConfigReader.fromConfigs([
  {
    context: '',
    data: {
      integrations: {
        awsCodeCommit: {
          type: 'example_account',
          project_id: 'abcd',
          private_key_id: '3687habh678abc',
          private_key:
            '-----BEGIN PRIVATE KEY-----example123key==\n-----END PRIVATE KEY-----\n',
          client_email: 'example-cicd-auth-sa@abcd.iam.gserviceaccount.com',
          client_id: '111111111111',
          auth_uri: 'https://example.com/o/oauth2/auth',
          token_uri: 'https://oauth2.example.com/token',
          auth_provider_x509_cert_url:
            'https://www.example.com/oauth2/v1/certs',
          client_x509_cert_url:
            'https://www.example.com/robot/v1/metadata/x509/abcd-cicd-auth-sa%12234ababcabc.iam.gserviceaccount.com',
          universe_domain: 'apiExample.com',
          gitToken: 'ghp_Abcabcabc',
          source: 'git',
        },
      },
    },
  },
]);

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});

