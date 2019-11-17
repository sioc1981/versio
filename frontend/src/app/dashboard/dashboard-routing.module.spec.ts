import { ReleaseRoutingModule } from './release-routing.module';

describe('ReleaseRoutingModule', () => {
  let releaseRoutingModule: ReleaseRoutingModule;

  beforeEach(() => {
    releaseRoutingModule = new ReleaseRoutingModule();
  });

  it('should create an instance', () => {
    expect(releaseRoutingModule).toBeTruthy();
  });
});
