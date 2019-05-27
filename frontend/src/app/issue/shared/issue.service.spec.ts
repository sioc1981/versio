import { TestBed } from '@angular/core/testing';

import { IssueService } from './issue.service';
import { AppModule } from 'src/app/app.module';

describe('IssueService', () => {
  beforeEach(() => TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    }));

  it('should be created', () => {
    const service: IssueService = TestBed.get(IssueService);
    expect(service).toBeTruthy();
  });
});
