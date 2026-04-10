import { flowsourceSeleniumPlugin } from './plugin';

describe('flowsource-selenium', () => {
  it('should export plugin', () => {
    expect(flowsourceSeleniumPlugin).toBeDefined();
  });
});
