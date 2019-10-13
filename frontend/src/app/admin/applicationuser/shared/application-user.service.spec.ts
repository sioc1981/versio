import { TestBed } from '@angular/core/testing';

import { ApplicationUserService } from './application-user.service';

describe('ApplicationUserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApplicationUserService = TestBed.get(ApplicationUserService);
    expect(service).toBeTruthy();
  });
});
