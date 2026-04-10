import { flowsourceCicdJenkinsPlugin } from './plugin';

describe('flowsource-cicd-jenkins', () => {
  it('should export plugin', () => {
    expect(flowsourceCicdJenkinsPlugin).toBeDefined();
  });
});
