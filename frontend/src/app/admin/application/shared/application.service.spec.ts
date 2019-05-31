import { TestBed } from '@angular/core/testing';

import { ApplicationService } from './application.service';
import { AppModule } from 'src/app/app.module';

describe('ApplicationService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    }));

  it('should be created', () => {
    const service: ApplicationService = TestBed.get(ApplicationService);
    expect(service).toBeTruthy();
  });
});
