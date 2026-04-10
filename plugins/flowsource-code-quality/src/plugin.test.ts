import { flowsourceCodeQualityPlugin } from './plugin';

describe('flowsource-code-quality', () => {
  it('should export plugin', () => {
    expect(flowsourceCodeQualityPlugin).toBeDefined();
  });
});
