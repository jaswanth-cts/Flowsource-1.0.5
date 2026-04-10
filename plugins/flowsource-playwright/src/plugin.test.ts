import { flowsourcePlaywrightPlugin } from './plugin';

describe('flowsource-playwright', () => {
  it('should export plugin', () => {
    expect(flowsourcePlaywrightPlugin).toBeDefined();
  });
});
