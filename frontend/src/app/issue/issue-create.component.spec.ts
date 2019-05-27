import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueCreateComponent } from './issue-create.component';
import { AppModule } from '../app.module';

describe('IssueCreateComponent', () => {
  let component: IssueCreateComponent;
  let fixture: ComponentFixture<IssueCreateComponent>;

  beforeEach(async(() => {
TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
