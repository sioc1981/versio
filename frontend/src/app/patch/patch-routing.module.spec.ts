import { PatchRoutingModule } from './patch-routing.module';

describe('PatchRoutingModule', () => {
  let patchRoutingModule: PatchRoutingModule;

  beforeEach(() => {
    patchRoutingModule = new PatchRoutingModule();
  });

  it('should create an instance', () => {
    expect(patchRoutingModule).toBeTruthy();
  });
});
