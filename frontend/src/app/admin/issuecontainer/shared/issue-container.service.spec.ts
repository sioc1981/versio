import { TestBed } from '@angular/core/testing';

import { IssueContainerService } from './issue-container.service';
import { AppModule } from 'src/app/app.module';

describe('IssueContainerService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    }));

  it('should be created', () => {
    const service: IssueContainerService = TestBed.get(IssueContainerService);
    expect(service).toBeTruthy();
  });
});
