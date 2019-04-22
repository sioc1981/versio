import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseImportComponent } from './release-import.component';

describe('ReleaseImportComponent', () => {
  let component: ReleaseImportComponent;
  let fixture: ComponentFixture<ReleaseImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
