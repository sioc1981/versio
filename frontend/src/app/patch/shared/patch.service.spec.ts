import { TestBed } from '@angular/core/testing';

import { PatchService } from './patch.service';
import { AppModule } from 'src/app/app.module';

describe('PatchService', () => {
  beforeEach(() => TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    }));

  it('should be created', () => {
    const service: PatchService = TestBed.get(PatchService);
    expect(service).toBeTruthy();
  });
});
