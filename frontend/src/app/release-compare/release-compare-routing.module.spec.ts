import { ReleaseCompareRoutingModule } from './release-compare-routing.module';

describe('ReleaseCompareRoutingModule', () => {
  let releaseCompareRoutingModule: ReleaseCompareRoutingModule;

  beforeEach(() => {
    releaseCompareRoutingModule = new ReleaseCompareRoutingModule();
  });

  it('should create an instance', () => {
    expect(releaseCompareRoutingModule).toBeTruthy();
  });
});
