import { flowsourcePrismacloudPlugin } from './plugin';

describe('flowsource-prismacloud', () => {
  it('should export plugin', () => {
    expect(flowsourcePrismacloudPlugin).toBeDefined();
  });
});
