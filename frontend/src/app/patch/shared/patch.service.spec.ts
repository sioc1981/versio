import { TestBed } from '@angular/core/testing';

import { PatchService } from './patch.service';

describe('PatchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PatchService = TestBed.get(PatchService);
    expect(service).toBeTruthy();
  });
});
