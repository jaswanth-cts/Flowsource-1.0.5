import { flowsourceAzureReleasePlugin } from './plugin';

describe('flowsource-azure-release', () => {
  it('should export plugin', () => {
    expect(flowsourceAzureReleasePlugin).toBeDefined();
  });
});
