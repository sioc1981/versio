import { TestBed } from '@angular/core/testing';

import { BatchOptionService } from './batch-option.service';

describe('BatchOptionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BatchOptionService = TestBed.get(BatchOptionService);
    expect(service).toBeTruthy();
  });
});
