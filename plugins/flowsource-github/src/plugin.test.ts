import { flowsourceGithubPlugin } from './plugin';

describe('flowsource-github', () => {
  it('should export plugin', () => {
    expect(flowsourceGithubPlugin).toBeDefined();
  });
});
