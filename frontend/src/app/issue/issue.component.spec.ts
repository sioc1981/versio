import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueComponent } from './issue.component';
import { AppModule } from '../app.module';

describe('IssueComponent', () => {
  let component: IssueComponent;
  let fixture: ComponentFixture<IssueComponent>;

  beforeEach(async(() => {
TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
