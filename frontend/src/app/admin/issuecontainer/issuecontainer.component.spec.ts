import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueContainerComponent } from './issuecontainer.component';
import { AppModule } from 'src/app/app.module';

describe('IssueContainerComponent', () => {
  let component: IssueContainerComponent;
  let fixture: ComponentFixture<IssueContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
