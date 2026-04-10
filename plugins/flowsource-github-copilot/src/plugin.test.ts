import { flowsourceGithubCopilotPlugin } from './plugin';

describe('flowsource-github-copilot', () => {
  it('should export plugin', () => {
    expect(flowsourceGithubCopilotPlugin).toBeDefined();
  });
});
