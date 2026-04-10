import { flowsourceAzureRepoPlugin } from './plugin';

describe('flowsource-azure-repo', () => {
  it('should export plugin', () => {
    expect(flowsourceAzureRepoPlugin).toBeDefined();
  });
});
