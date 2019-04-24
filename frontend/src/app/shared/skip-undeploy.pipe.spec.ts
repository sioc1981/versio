import { SkipUndeployPipe } from './skip-undeploy.pipe';

describe('SkipUndeployPipe', () => {
  it('create an instance', () => {
    const pipe = new SkipUndeployPipe();
    expect(pipe).toBeTruthy();
  });
});
