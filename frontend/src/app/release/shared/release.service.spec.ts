import { TestBed } from '@angular/core/testing';

import { ReleaseService } from './release.service';
import { AppModule } from 'src/app/app.module';

describe('ReleaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    }));

  it('should be created', () => {
    const service: ReleaseService = TestBed.get(ReleaseService);
    expect(service).toBeTruthy();
  });
});
