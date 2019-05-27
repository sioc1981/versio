import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueUpdateComponent } from './issue-update.component';
import { AppModule } from '../app.module';

describe('IssueUpdateComponent', () => {
  let component: IssueUpdateComponent;
  let fixture: ComponentFixture<IssueUpdateComponent>;

  beforeAll(async(() => {
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
