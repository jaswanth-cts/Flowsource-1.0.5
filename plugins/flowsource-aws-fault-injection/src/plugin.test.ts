import { flowsourceAwsFaultInjectionPlugin } from './plugin';

describe('flowsource-aws-fault-injection', () => {
  it('should export plugin', () => {
    expect(flowsourceAwsFaultInjectionPlugin).toBeDefined();
  });
});
