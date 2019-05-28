import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueUpdateComponent } from './issue-update.component';
import { AppModule } from '../app.module';
import { Issue } from './shared/issue.model';

describe('IssueUpdateComponent', () => {
  let component: IssueUpdateComponent;
  let fixture: ComponentFixture<IssueUpdateComponent>;
  const issue: Issue = {
    reference: '123',
    container: 'JIRA',
    description: 'description',
    globalReference: null
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueUpdateComponent);
    component = fixture.componentInstance;
    component.issue = issue;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
