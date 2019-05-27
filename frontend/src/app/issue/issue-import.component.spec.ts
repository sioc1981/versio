import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueImportComponent } from './issue-import.component';
import { AppModule } from '../app.module';

describe('IssueImportComponent', () => {
  let component: IssueImportComponent;
  let fixture: ComponentFixture<IssueImportComponent>;

  beforeEach(async(() => {
TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
