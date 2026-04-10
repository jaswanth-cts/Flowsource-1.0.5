import { flowsourceFeatureflagPlugin } from './plugin';

describe('flowsource-featureflag', () => {
  it('should export plugin', () => {
    expect(flowsourceFeatureflagPlugin).toBeDefined();
  });
});
