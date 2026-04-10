import { flowsourceDatadogPlugin } from './plugin';

describe('flowsource-datadog', () => {
  it('should export plugin', () => {
    expect(flowsourceDatadogPlugin).toBeDefined();
  });
});
