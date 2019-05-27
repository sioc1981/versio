import { TestBed } from '@angular/core/testing';

import { SseService } from './sse.service';
import { AppModule } from '../app.module';

describe('SseService', () => {
  beforeEach(() => TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    }));

  it('should be created', () => {
    const service: SseService = TestBed.get(SseService);
    expect(service).toBeTruthy();
  });
});
